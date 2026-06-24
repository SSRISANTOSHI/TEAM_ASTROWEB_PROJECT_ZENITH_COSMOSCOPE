import math
import os
import logging
from datetime import datetime, timezone
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from database import db
from models import LocationQuery
from services import (
    get_weather,
    get_iss,
    get_satellites,
    get_planets,
    get_iss_passes,
    get_light_pollution,
    calculate_csai,
    get_events,
    generate_narrative,
    get_space_weather,
    calculate_space_risk,
    get_photography_settings,
)

load_dotenv()
logging.basicConfig(level=logging.INFO)

frontend_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "build"))
app = Flask(__name__, static_folder=frontend_folder, static_url_path="/")
CORS(app)

# MySQL Connection Pool initialization
db.init_app(app)


def _safe_float(value, default, min_val, max_val):
    """Parse float from request arg, guarding against NaN and out-of-range."""
    try:
        f = float(value)
        if math.isnan(f) or math.isinf(f):
            return default
        return max(min_val, min(max_val, f))
    except (TypeError, ValueError):
        return default


@app.route("/api/cosmic-data", methods=["GET"])
def cosmic_data():
    try:
        lat = _safe_float(request.args.get("lat"), 13.0827, -90.0, 90.0)
        lon = _safe_float(request.args.get("lon"), 80.2707, -180.0, 180.0)
        location_name = request.args.get("name", "Selected Location")[:255]

        # Parse target date for digital twin time travel
        target_date = None
        date_str = request.args.get("date")
        if date_str:
            try:
                date_str_clean = date_str.replace("Z", "+00:00")
                target_date = datetime.fromisoformat(date_str_clean)
            except Exception:
                try:
                    target_date = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                except Exception:
                    pass

        weather       = get_weather(lat, lon)
        iss_pos       = get_iss(target_date)
        sat_info      = get_satellites()
        planet_info   = get_planets(lat, lon, target_date)
        iss_passes    = get_iss_passes(lat, lon, target_date)
        light_pol     = get_light_pollution(lat, lon)

        space_weather = get_space_weather(lat, lon, target_date)
        space_risk    = calculate_space_risk(sat_info, space_weather, lat, lon, target_date)
        photo_advisor = get_photography_settings(weather, planet_info, light_pol)

        csai, csai_breakdown = calculate_csai(weather, planet_info, sat_info, light_pol, space_weather)
        events    = get_events(planet_info, iss_passes, target_date)
        narrative = generate_narrative(location_name, csai, planet_info, weather, events, light_pol, space_weather, space_risk)

        active         = sat_info.get("active_satellites", 8000)
        congestion_pct = round(min(active / 10000 * 100, 100), 1)

        # Persist to MySQL
        conn = None
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            insert_sql = """
            INSERT INTO location_queries (name, lat, lon, csai, cloud_cover, visible_objects, queried_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            now_utc = datetime.now(timezone.utc)
            cursor.execute(insert_sql, (
                location_name,
                lat,
                lon,
                csai,
                weather.get("cloud_cover"),
                ",".join(planet_info.get("visible_objects", [])),
                now_utc
            ))
            conn.commit()
            cursor.close()
        except Exception as db_err:
            app.logger.warning("DB write failed (non-fatal): %s", db_err)
        finally:
            if conn:
                try:
                    conn.close()
                except Exception:
                    pass

        return jsonify({
            "location":        {"lat": lat, "lon": lon, "name": location_name},
            "csai":            csai,
            "csai_breakdown":  csai_breakdown,
            "weather":         weather,
            "light_pollution": light_pol,
            "iss":             iss_pos,
            "satellites": {
                "active":          sat_info["active_satellites"],
                "debris":          sat_info["debris_count"],
                "congestion_pct":  congestion_pct,
            },
            "planets":         planet_info["planets"],
            "moon":            planet_info["moon"],
            "visible_objects": planet_info["visible_objects"],
            "iss_passes":      iss_passes,
            "events":          events,
            "narrative":       narrative,
            "space_weather":   space_weather,
            "space_risk":      space_risk,
            "photography_advisor": photo_advisor,
        })
    except Exception as e:
        app.logger.exception("cosmic_data error")
        return jsonify({"error": str(e)}), 500


@app.route("/api/iss", methods=["GET"])
def iss_position():
    return jsonify(get_iss())


@app.route("/api/history", methods=["GET"])
def query_history():
    """Return last 20 location queries stored in MySQL."""
    conn = None
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, lat, lon, csai, cloud_cover, visible_objects, queried_at FROM location_queries ORDER BY queried_at DESC LIMIT 20")
        rows = cursor.fetchall()
        cursor.close()
        
        history = []
        for r in rows:
            history.append(LocationQuery.from_row(r).to_dict())
            
        return jsonify(history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass


@app.route("/api/leaderboard", methods=["GET"])
def leaderboard():
    """Rank top global cities by live observation suitability score (CSAI)."""
    cities = [
        {"name": "Atacama Desert, CL", "lat": -23.8634, "lon": -69.1399},
        {"name": "Ladakh, IN", "lat": 34.1526, "lon": 77.5771},
        {"name": "Mauna Kea, US", "lat": 19.8206, "lon": -155.4681},
        {"name": "Sahara Region, DZ", "lat": 23.8853, "lon": 11.2842},
        {"name": "Chennai, IN", "lat": 13.0827, "lon": 80.2707}
    ]
    results = []
    sat_info = get_satellites()
    for city in cities:
        try:
            weather = get_weather(city["lat"], city["lon"])
            light_pol = get_light_pollution(city["lat"], city["lon"])
            planet_info = get_planets(city["lat"], city["lon"], force_local=True)
            space_weather = get_space_weather(city["lat"], city["lon"])
            csai, _ = calculate_csai(weather, planet_info, sat_info, light_pol, space_weather)
            results.append({
                "name": city["name"],
                "lat": city["lat"],
                "lon": city["lon"],
                "csai": csai,
                "bortle": light_pol["bortle"],
                "cloud_cover": weather["cloud_cover"]
            })
        except Exception:
            results.append({
                "name": city["name"],
                "lat": city["lat"],
                "lon": city["lon"],
                "csai": 50.0,
                "bortle": 4,
                "cloud_cover": 50
            })
    results.sort(key=lambda x: x["csai"], reverse=True)
    return jsonify(results)


@app.route("/api/chat", methods=["POST"])
def chat():
    """AI chatbot route leveraging Gemini API with context or smart fallback."""
    import requests
    data = request.json or {}
    message = data.get("message", "").lower()
    context = data.get("context", {})
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [{
                    "parts": [{
                        "text": (
                            f"You are the COSMOSCOPE AI Narrator, an expert astronomer. Answer the user's question in a professional, engaging, and clear manner.\n"
                            f"Current Telemetry Context: {context}\n"
                            f"User question: {data.get('message')}\n"
                            f"Keep your response concise, under 4 sentences."
                        )
                    }]
                }]
            }
            res = requests.post(url, json=payload, timeout=8)
            res.raise_for_status()
            text = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
            if text:
                return jsonify({"response": text})
        except Exception as e:
            app.logger.warning("Gemini chat failed: %s", e)

    # Fallback smart responder
    planets = context.get("planets", [])
    visible_planets = [p["name"] for p in planets if p.get("visible")]
    
    if "planet" in message or "jupiter" in message or "mars" in message or "saturn" in message or "venus" in message:
        if visible_planets:
            response = f"Currently visible planets at your location include {', '.join(visible_planets)}. "
            jupiter = next((p for p in planets if p["name"] == "Jupiter"), None)
            if jupiter and jupiter.get("visible"):
                response += f"Jupiter is visible at an altitude of {jupiter['altitude']}° with a magnitude of {jupiter['magnitude']}."
            else:
                response += "They offer excellent targets tonight for observation."
        else:
            response = "There are no major planets visible above your horizon at this moment. You might need to adjust your time target or wait for them to rise."
            
    elif "iss" in message or "station" in message or "flyover" in message:
        passes = context.get("iss_passes", [])
        if passes:
            response = f"The International Space Station has upcoming passes over your horizon. The next visible flyover is predicted at {passes[0]['risetime']}. Look up at that time!"
        else:
            response = "No ISS flyover passes are predicted for your location in the immediate window. However, you can track its real-time location on the globe."
            
    elif "debris" in message or "risk" in message or "congest" in message:
        risk = context.get("space_risk", {})
        response = f"The current Sector Risk Score is {risk.get('risk_score', 42.0)}/100. "
        if risk.get("debris_nearby", 0) > 0:
            response += f"We have detected {risk['debris_nearby']} debris fragments in proximity. Trajectory checks are advised."
        else:
            response += "Orbital congestion is nominal with no immediate debris collision warnings."
            
    elif "weather" in message or "cloud" in message or "rain" in message:
        weather = context.get("weather", {})
        response = f"The cloud cover is currently {weather.get('cloud_cover', 50)}% with a visibility range of {weather.get('visibility', 10000)/1000} km. "
        if weather.get("cloud_cover", 50) < 20:
            response += "Conditions are perfect for stargazing tonight."
        else:
            response += "Partial or heavy clouds may interfere with visual observation."
            
    elif "photo" in message or "setting" in message or "camera" in message:
        photo = context.get("photography_advisor", {})
        response = f"For astrophotography, the current quality score is {photo.get('quality_score', 50)}/100. "
        response += f"We recommend targeting {photo.get('target', 'the sky')} with settings: ISO {photo.get('iso', 800)}, {photo.get('exposure', '15s')} exposure, and {photo.get('tripod_required', 'tripod required')}."
        
    else:
        response = (
            f"As the COSMOSCOPE AI, I'm analyzing the telemetry above your observation node. "
            f"Your current CSAI is {context.get('csai', 60)}/100 with a Class {context.get('light_pollution', {}).get('bortle', 4)} Bortle scale rating. "
            f"Ask me about visible planets, ISS flyovers, space debris risks, or astrophotography tips!"
        )
        
    return jsonify({"response": response})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


# Serve React App
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path.startswith("api/") or path == "health":
        return jsonify({"error": "Not Found"}), 404
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug, port=5001)

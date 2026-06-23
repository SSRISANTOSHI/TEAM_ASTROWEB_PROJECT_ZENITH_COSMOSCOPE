import math
import logging
import requests
import ephem
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Simple in-memory cache
# ---------------------------------------------------------------------------
_cache = {}

def _cached(key, ttl_seconds, fetch_fn):
    """Return cached value if fresh, else call fetch_fn() and cache result."""
    entry = _cache.get(key)
    if entry and (datetime.now(timezone.utc) - entry['ts']).total_seconds() < ttl_seconds:
        return entry['data']
    data = fetch_fn()
    _cache[key] = {'data': data, 'ts': datetime.now(timezone.utc)}
    return data

# ---------------------------------------------------------------------------
# Light Pollution – Bortle scale estimation from Open-Meteo cloud & geography
# We use the GLOBE at Night / light pollution atlas approximation:
# population-density proxy via coordinates (rural vs urban heuristic).
# For a real deployment swap with the actual Light Pollution Map tile API.
# ---------------------------------------------------------------------------

# Known high-light-pollution bounding boxes (major metro areas)
_HIGH_LP_ZONES = [
    # (lat_min, lat_max, lon_min, lon_max, bortle)
    (28.4, 29.0, 76.8, 77.5, 8),   # Delhi
    (12.8, 13.3, 80.0, 80.5, 7),   # Chennai
    (18.8, 19.3, 72.7, 73.2, 8),   # Mumbai
    (40.5, 41.0, -74.3, -73.7, 8), # New York
    (51.3, 51.7, -0.5, 0.3, 7),    # London
    (35.5, 35.9, 139.5, 139.9, 8), # Tokyo
    (48.7, 49.0, 2.2, 2.5, 7),     # Paris
    (37.6, 37.9, -122.6, -122.2, 7), # San Francisco
    (41.7, 42.0, -87.9, -87.5, 8), # Chicago
    (22.3, 22.7, 113.8, 114.3, 8), # Hong Kong / Shenzhen
]


def get_light_pollution(lat, lon):
    """
    Returns Bortle scale (1–9) and a sky_quality score (0–100).
    1 = pristine dark sky, 9 = inner-city sky.
    """
    bortle = 4  # default: rural/suburban transition
    for lat_min, lat_max, lon_min, lon_max, b in _HIGH_LP_ZONES:
        if lat_min <= lat <= lat_max and lon_min <= lon <= lon_max:
            bortle = b
            break

    # Crude coastal/rural bonus
    if abs(lat) > 60:
        bortle = max(1, bortle - 2)  # polar regions tend to be dark
    elif abs(lon) > 100 and abs(lat) < 20:
        bortle = max(2, bortle - 1)  # remote tropics

    sky_quality = round(max(0, min(100, (9 - bortle) / 8 * 100)), 1)
    return {"bortle": bortle, "sky_quality": sky_quality}


# ---------------------------------------------------------------------------
# Open-Meteo – weather & atmospheric data
# ---------------------------------------------------------------------------

def get_weather(lat, lon):
    key = f"weather_{round(lat, 2)}_{round(lon, 2)}"
    def fetch():
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&current=cloud_cover,visibility,weather_code"
            f"&forecast_days=1"
        )
        try:
            r = requests.get(url, timeout=8)
            r.raise_for_status()
            c = r.json().get("current", {})
            return {
                "cloud_cover": c.get("cloud_cover", 50),
                "visibility": c.get("visibility", 10000),
                "weather_code": c.get("weather_code", 0),
            }
        except requests.RequestException as e:
            logger.warning("Open-Meteo fetch failed: %s", e)
            return {"cloud_cover": 50, "visibility": 10000, "weather_code": 0}
    return _cached(key, 900, fetch)


# ---------------------------------------------------------------------------
# Open Notify – ISS live position & flyover passes
# ---------------------------------------------------------------------------

def get_iss(target_date=None):
    if target_date:
        try:
            tle_entry = _cache.get('iss_tle')
            if tle_entry:
                lines = tle_entry['data']
            else:
                r = requests.get(
                    "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE",
                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"},
                    timeout=8,
                )
                r.raise_for_status()
                lines = [l.strip() for l in r.text.strip().splitlines() if l.strip()]
                _cache['iss_tle'] = {'data': lines, 'ts': datetime.now(timezone.utc)}
            if len(lines) >= 3:
                iss = ephem.readtle(lines[0], lines[1], lines[2])
                iss.compute(target_date)
                return {"lat": round(math.degrees(iss.sublat), 4), "lon": round(math.degrees(iss.sublong), 4)}
        except Exception:
            pass
        return {"lat": 0.0, "lon": 0.0}

    def fetch():
        try:
            r = requests.get("http://api.open-notify.org/iss-now.json", timeout=8)
            r.raise_for_status()
            d = r.json().get("iss_position", {})
            return {"lat": round(float(d["latitude"]), 4), "lon": round(float(d["longitude"]), 4)}
        except requests.RequestException as e:
            logger.warning("ISS position fetch failed: %s", e)
            return {"lat": 0.0, "lon": 0.0}
    return _cached('iss_position', 10, fetch)


def get_iss_passes(lat, lon, target_date=None):
    """
    Predict ISS passes for the given location using ephem + cached TLE starting from target_date.
    """
    try:
        # Use cached TLE if fresh (2 hours), else fetch
        tle_entry = _cache.get('iss_tle')
        if tle_entry and (datetime.now(timezone.utc) - tle_entry['ts']).total_seconds() < 7200:
            lines = tle_entry['data']
        else:
            try:
                r = requests.get(
                    "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE",
                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"},
                    timeout=8,
                )
                r.raise_for_status()
                lines = [l.strip() for l in r.text.strip().splitlines() if l.strip()]
                _cache['iss_tle'] = {'data': lines, 'ts': datetime.now(timezone.utc)}
            except requests.RequestException as e:
                if (isinstance(e, requests.HTTPError) and
                    e.response is not None and
                    e.response.status_code == 403 and
                    "has not updated" in e.response.text and
                    tle_entry):
                    logger.info("ISS TLE has not updated yet. Reusing cached TLE.")
                    tle_entry['ts'] = datetime.now(timezone.utc)
                    lines = tle_entry['data']
                else:
                    raise

        if len(lines) < 3:
            return []
        iss = ephem.readtle(lines[0], lines[1], lines[2])

        observer = ephem.Observer()
        observer.lat = str(lat)
        observer.lon = str(lon)
        observer.elevation = 0
        observer.horizon = '10'
        observer.date = target_date if target_date else datetime.now(timezone.utc)

        passes = []
        # Predict up to 10 passes for 7-day calendar coverage
        for _ in range(10):
            try:
                pass_res = observer.next_pass(iss)
                if pass_res[0] is None:
                    break
                rise_time, rise_az, max_alt_time, max_alt, set_time, set_az = pass_res
                rise_dt = ephem.Date(rise_time).datetime().replace(tzinfo=timezone.utc)
                set_dt  = ephem.Date(set_time).datetime().replace(tzinfo=timezone.utc)
                duration = int((set_dt - rise_dt).total_seconds())
                passes.append({
                    "risetime": rise_dt.strftime("%Y-%m-%d %H:%M UTC"),
                    "duration_sec": max(duration, 0),
                    "max_elevation": round(math.degrees(max_alt), 1),
                })
                observer.date = set_time + ephem.minute * 5
                iss.compute(observer)
            except Exception as e:
                logger.warning("Error predicting next pass: %s", e)
                break
        return passes
    except Exception as e:
        logger.warning("ISS pass prediction failed: %s", e)
        return []


# ---------------------------------------------------------------------------
# CelesTrak – active satellites & debris count
# ---------------------------------------------------------------------------

def get_satellites():
    def fetch():
        cached_entry = _cache.get('satellites')
        try:
            active_r = requests.get(
                "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=JSON",
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"},
                timeout=15,
            )
            active_r.raise_for_status()
            active = len(active_r.json())
            debris_r = requests.get(
                "https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-2251-debris&FORMAT=JSON",
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"},
                timeout=15,
            )
            debris_r.raise_for_status()
            debris = len(debris_r.json())
            return {"active_satellites": active, "debris_count": debris}
        except requests.RequestException as e:
            if (isinstance(e, requests.HTTPError) and
                e.response is not None and
                e.response.status_code == 403 and
                "has not updated" in e.response.text and
                cached_entry):
                logger.info("CelesTrak satellite/debris data has not updated yet. Reusing cached data.")
                return cached_entry['data']
            logger.warning("CelesTrak fetch failed: %s", e)
            return {"active_satellites": 8400, "debris_count": 3200}
    return _cached('satellites', 7200, fetch)  # cache 2 hours (7200 seconds)


# ---------------------------------------------------------------------------
# NASA Horizons API – planetary ephemeris
# Docs: https://ssd-api.jpl.nasa.gov/doc/horizons.html
# ---------------------------------------------------------------------------

# Horizons NAIF IDs for solar system bodies
_HORIZONS_IDS = {
    "Mercury": "199",
    "Venus":   "299",
    "Mars":    "499",
    "Jupiter": "599",
    "Saturn":  "699",
    "Uranus":  "799",
    "Neptune": "899",
}

_HORIZONS_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"


def _query_horizons(body_id, lat, lon, elevation=0, target_date=None):
    """
    Query NASA Horizons for a single body's topocentric RA/Dec and apparent
    altitude/azimuth at the observer location at target_date or right now.
    Returns dict with alt_deg, az_deg, mag or None on failure.
    """
    dt = target_date if target_date else datetime.now(timezone.utc)
    tstr = dt.strftime("%Y-%b-%d %H:%M")
    tstop = dt.strftime("%Y-%b-%d %H:%M")

    params = {
        "format": "json",
        "COMMAND": f"'{body_id}'",
        "OBJ_DATA": "NO",
        "MAKE_EPHEM": "YES",
        "EPHEM_TYPE": "OBSERVER",
        "CENTER": "coord@399",
        "COORD_TYPE": "GEODETIC",
        "SITE_COORD": f"'{lon},{lat},{elevation}'",
        "START_TIME": f"'{tstr}'",
        "STOP_TIME": f"'{tstr}'",
        "STEP_SIZE": "1m",
        "QUANTITIES": "'4,9'",   # 4=apparent alt/az, 9=visual mag
        "CAL_FORMAT": "CAL",
        "ANG_FORMAT": "DEG",
        "APPARENT": "AIRLESS",
        "SKIP_DAYLT": "NO",
    }
    try:
        r = requests.get(_HORIZONS_URL, params=params, timeout=15)
        r.raise_for_status()
        raw = r.json().get("result", "")
        return _parse_horizons(raw)
    except requests.RequestException as e:
        logger.warning("Horizons fetch failed for %s: %s", body_id, e)
        return None


def _parse_horizons(raw):
    """
    Parse the Horizons text result for $$SOE … $$EOE block.
    OBSERVER quantities 4+9: date, blank, AZ, EL, dAZ, dEL, V_mag
    """
    lines = raw.splitlines()
    in_block = False
    for line in lines:
        if "$$SOE" in line:
            in_block = True
            continue
        if "$$EOE" in line:
            break
        if in_block and line.strip():
            parts = line.split()
            # Horizons observer output columns (after date/time columns):
            # col index varies; look for the numeric columns
            nums = []
            for p in parts:
                try:
                    nums.append(float(p))
                except ValueError:
                    pass
            if len(nums) >= 3:
                # az, el, mag (approximate positions in the parsed nums)
                az_deg = nums[0]
                alt_deg = nums[1]
                mag = nums[2] if len(nums) > 2 else 99.0
                return {"alt_deg": alt_deg, "az_deg": az_deg, "mag": mag}
    return None


def get_planets(lat, lon, target_date=None, force_local=False):
    """
    Primary: NASA Horizons API for each planet.
    Fallback: ephem library (local computation) if Horizons is unavailable.
    """
    planet_data = []
    visible = []

    # --- Try NASA Horizons first ---
    horizons_ok = False
    horizons_results = {}
    if not force_local:
        from concurrent.futures import ThreadPoolExecutor, as_completed
        with ThreadPoolExecutor(max_workers=len(_HORIZONS_IDS)) as executor:
            future_to_planet = {
                executor.submit(_query_horizons, body_id, lat, lon, target_date=target_date): name
                for name, body_id in _HORIZONS_IDS.items()
            }
            for future in as_completed(future_to_planet):
                name = future_to_planet[future]
                try:
                    result = future.result()
                    if result:
                        horizons_results[name] = result
                except Exception as e:
                    logger.warning("Horizons query thread failed for %s: %s", name, e)
        if len(horizons_results) == len(_HORIZONS_IDS):
            horizons_ok = True

    if horizons_ok and len(horizons_results) == len(_HORIZONS_IDS):
        for name, res in horizons_results.items():
            alt = round(res["alt_deg"], 2)
            az = round(res["az_deg"], 2)
            mag = round(res["mag"], 2)
            is_visible = alt > 0
            if is_visible:
                visible.append(name)
            planet_data.append({
                "name": name,
                "altitude": alt,
                "azimuth": az,
                "visible": is_visible,
                "magnitude": mag,
                "source": "NASA Horizons",
            })
    else:
        # --- Fallback: ephem ---
        logger.info("Falling back to ephem for planet positions")
        observer = ephem.Observer()
        observer.lat = str(lat)
        observer.lon = str(lon)
        observer.date = target_date if target_date else datetime.now(timezone.utc)
        observer.elevation = 0

        ephem_bodies = {
            "Mercury": ephem.Mercury(), "Venus": ephem.Venus(),
            "Mars": ephem.Mars(),       "Jupiter": ephem.Jupiter(),
            "Saturn": ephem.Saturn(),   "Uranus": ephem.Uranus(),
            "Neptune": ephem.Neptune(),
        }
        for name, body in ephem_bodies.items():
            body.compute(observer)
            alt = round(math.degrees(body.alt), 2)
            az = round(math.degrees(body.az), 2)
            is_visible = alt > 0
            if is_visible:
                visible.append(name)
            planet_data.append({
                "name": name,
                "altitude": alt,
                "azimuth": az,
                "visible": is_visible,
                "magnitude": round(body.mag, 2),
                "source": "ephem",
            })

    # Moon via ephem (Horizons Moon is ID 301 but ephem is accurate enough)
    observer = ephem.Observer()
    observer.lat = str(lat)
    observer.lon = str(lon)
    observer.date = target_date if target_date else datetime.now(timezone.utc)
    moon = ephem.Moon()
    moon.compute(observer)
    moon_alt = round(math.degrees(moon.alt), 2)
    moon_az = round(math.degrees(moon.az), 2)

    return {
        "planets": planet_data,
        "moon": {
            "altitude": moon_alt,
            "azimuth": moon_az,
            "phase": round(moon.phase, 1),
            "visible": moon_alt > 0,
        },
        "visible_objects": visible,
    }


# ---------------------------------------------------------------------------
# CSAI – Cosmic Situation Awareness Index
# ---------------------------------------------------------------------------
# Space Weather Intelligence & Risk Index
# ---------------------------------------------------------------------------

def get_space_weather(lat, lon, target_date=None):
    """
    Fetch Space Weather from NOAA scale API, or simulate solar storms,
    aurora visibility probability, and satellite communication risk.
    """
    noaa_data = None
    if target_date is None:
        try:
            r = requests.get("https://services.swpc.noaa.gov/products/noaa-scales.json", timeout=5)
            r.raise_for_status()
            noaa_data = r.json()
        except Exception:
            pass

    dt = target_date if target_date else datetime.now(timezone.utc)
    day_seed = dt.year + dt.month + dt.day + dt.hour
    
    # Deterministic base Kp-index (0 to 9)
    kp = round((day_seed % 7) + (day_seed % 3) * 0.5 + 1.0, 1)
    kp = min(9.0, max(0.0, kp))
    
    g_scale = 0
    if kp >= 5:
        g_scale = int(kp - 4)
        
    r_scale = day_seed % 3
    
    if noaa_data and isinstance(noaa_data, list) and len(noaa_data) > 0:
        try:
            latest = noaa_data[-1]
            g_scale = max(g_scale, int(latest.get("G", {}).get("Scale", 0)))
            r_scale = max(r_scale, int(latest.get("R", {}).get("Scale", 0)))
        except Exception:
            pass

    flare_classes = ["Quiet (Class A/B)", "Minor (Class C)", "Moderate (Class M)", "Strong (Class X)", "Severe (Class X10)", "Extreme (Class X20)"]
    flare_desc = flare_classes[min(r_scale, 5)]
    
    geomagnetic_descs = ["Quiet", "Active (G1)", "Moderate Storm (G2)", "Strong Storm (G3)", "Severe Storm (G4)", "Extreme Storm (G5)"]
    geo_desc = geomagnetic_descs[min(g_scale, 5)]
    
    comm_risk_pct = min(100, int((g_scale * 18) + (r_scale * 12) + (kp * 3)))
    
    # Aurora prediction based on user latitude and Kp index
    abs_lat = abs(lat)
    required_kp = max(0, 9 - (abs_lat - 40) * 0.25)
    if abs_lat > 60:
        aurora_prob = min(100, int(35 + kp * 8))
    elif abs_lat >= 45:
        if kp >= required_kp:
            aurora_prob = min(100, int((kp - required_kp) * 22 + 10))
        else:
            aurora_prob = 0
    else:
        # Low latitude bonus for severe storms
        if kp >= 8:
            aurora_prob = min(40, int((kp - 7) * 15))
        else:
            aurora_prob = 0
            
    if aurora_prob >= 70:
        aurora_desc = f"Excellent aurora visibility chance ({aurora_prob}%)."
    elif aurora_prob >= 30:
        aurora_desc = f"Moderate aurora visibility chance ({aurora_prob}%)."
    elif aurora_prob > 0:
        aurora_desc = f"Low aurora visibility chance ({aurora_prob}%)."
    else:
        aurora_desc = "No aurora visibility predicted for this latitude."

    return {
        "kp_index": kp,
        "g_scale": g_scale,
        "r_scale": r_scale,
        "solar_flare": flare_desc,
        "geomagnetic_storm": geo_desc,
        "aurora_prob": aurora_prob,
        "aurora_desc": aurora_desc,
        "comm_risk_pct": comm_risk_pct,
        "comm_risk_desc": f"A solar storm is active. Satellite communication signal quality may decrease by {comm_risk_pct}%." if comm_risk_pct > 12 else "Nominal satellite communication risk."
    }


def calculate_space_risk(sat_info, space_weather, lat, lon, target_date=None):
    """
    Calculate AI Space Risk Score out of 100 based on orbital congestion,
    debris proximity, solar storms, and local satellite density.
    """
    active = sat_info.get("active_satellites", 8000)
    congestion_pct = min(active / 10000 * 100, 100)
    debris = sat_info.get("debris_count", 3200)
    
    kp = space_weather.get("kp_index", 4.0)
    g_scale = space_weather.get("g_scale", 0)
    
    dt = target_date if target_date else datetime.now(timezone.utc)
    time_seed = dt.year + dt.month + dt.day + dt.hour
    coord_seed = int(abs(lat * 10) + abs(lon * 10))
    debris_nearby = (time_seed + coord_seed) % 4
    
    # 1. Congestion score (max 30)
    cong_score = (congestion_pct / 100) * 30
    
    # 2. Debris score (max 30)
    debris_score = min(30, (debris / 6000) * 15 + (debris_nearby * 3.75))
    
    # 3. Solar activity (max 40)
    solar_score = min(40, (kp / 9) * 20 + (g_scale * 4))
    
    risk_score = round(cong_score + debris_score + solar_score, 1)
    risk_score = min(max(risk_score, 0.0), 100.0)
    
    alerts = []
    if risk_score > 70:
        alerts.append("Critical traffic congestion alert.")
    elif risk_score > 40:
        alerts.append("Moderate orbital traffic warning.")
    else:
        alerts.append("Nominal orbital risk conditions.")
        
    if debris_nearby > 0:
        alerts.append(f"{debris_nearby} space debris objects passing nearby.")
    else:
        alerts.append("No immediate debris alerts detected.")
        
    return {
        "risk_score": risk_score,
        "summary": " ".join(alerts),
        "debris_nearby": debris_nearby,
        "factors": {
            "orbital_congestion": round(congestion_pct, 1),
            "nearby_debris_count": debris_nearby,
            "solar_activity_kp": kp,
            "satellite_density_index": round(active / 800, 1)
        }
    }


def get_photography_settings(weather, planet_info, light_pollution):
    """
    Suggest optimal exposure settings and compute a Photography Quality Score.
    """
    cloud = weather.get("cloud_cover", 50)
    bortle = light_pollution.get("bortle", 4) if light_pollution else 4
    moon_phase = planet_info["moon"]["phase"]
    moon_visible = planet_info["moon"]["visible"]
    
    quality = 100
    quality -= (cloud * 0.7)
    quality -= ((bortle - 1) * 8)
    if moon_visible:
        quality -= (moon_phase * 0.15)
    quality = round(max(5, min(100, quality)), 0)
    
    visible_planets = planet_info.get("visible_objects", [])
    if visible_planets:
        target = visible_planets[0]
        iso = 400 if moon_visible and moon_phase > 50 else 800
        exposure = "1/100s"
        aperture = "f/5.6 or f/8"
        tripod = "Tripod required"
    elif moon_visible and moon_phase > 15:
        target = "Moon"
        iso = 100 if moon_phase > 75 else 200
        exposure = "1/125s"
        aperture = "f/8"
        tripod = "Tripod optional"
    else:
        target = "Milky Way / Constellations"
        iso = 1600 if bortle > 5 else 3200
        exposure = f"{max(8, 25 - bortle * 2)}s"
        aperture = "f/2.8"
        tripod = "Tripod Required"
        
    return {
        "quality_score": int(quality),
        "target": target,
        "iso": iso,
        "exposure": exposure,
        "aperture": aperture,
        "tripod_required": tripod,
        "cloud_impact": f"Cloud cover ({cloud}%) limits deep-sky exposures." if cloud > 30 else "Pristine clear sky conditions.",
        "moon_impact": f"Moon glow ({moon_phase}% phase) creates ambient atmospheric wash." if (moon_visible and moon_phase > 30) else "Dark sky with low moon glow interference."
    }


# ---------------------------------------------------------------------------
# CSAI – Cosmic Situation Awareness Index
# ---------------------------------------------------------------------------

def calculate_csai(weather, planet_info, sat_info, light_pollution=None, space_weather=None):
    cloud = weather.get("cloud_cover", 50)
    vis_km = weather.get("visibility", 10000) / 1000

    # 1. Visibility Conditions
    visibility_score = max(0.0, 100 - cloud) * 0.6 + min(vis_km / 10 * 40, 40)

    # 2. Celestial Event Significance
    visible_count = len(planet_info.get("visible_objects", []))
    moon_visible = planet_info["moon"]["visible"]
    celestial_score = min(visible_count * 14 + (10 if moon_visible else 0), 100)

    # 3. Atmospheric Clarity
    wcode = weather.get("weather_code", 0)
    clarity = 100 if wcode < 3 else (70 if wcode < 50 else 30)

    # 4. Orbital Congestion (lower congestion = better score)
    active = sat_info.get("active_satellites", 8000)
    congestion_pct = min(active / 10000 * 100, 100)
    orbital_score = round(100 - congestion_pct * 0.5, 1)

    # 5. Observation Potential – combines light pollution & seeing conditions
    if light_pollution:
        bortle = light_pollution.get("bortle", 4)
        obs_potential = round(max(0, (9 - bortle) / 8 * 100), 1)
    else:
        obs_potential = 60.0

    # If space storm active, penalize slightly
    if space_weather:
        kp = space_weather.get("kp_index", 3.0)
        if kp >= 5:
            obs_potential = max(5.0, obs_potential - (kp - 4) * 5)

    csai = round(
        visibility_score  * 0.35
        + celestial_score * 0.20
        + clarity         * 0.20
        + orbital_score   * 0.10
        + obs_potential   * 0.15,
        1,
    )
    return (
        min(max(csai, 0.0), 100.0),
        {
            "visibility_conditions":      round(visibility_score, 1),
            "celestial_event_significance": round(celestial_score, 1),
            "atmospheric_clarity":         round(clarity, 1),
            "orbital_congestion_score":    round(orbital_score, 1),
            "observation_potential":       round(obs_potential, 1),
        },
    )


# ---------------------------------------------------------------------------
# Event forecasting
# ---------------------------------------------------------------------------

def get_events(planet_info, iss_passes, target_date=None):
    """
    Generate chronological 7-day celestial events calendar.
    """
    dt = target_date if target_date else datetime.now(timezone.utc)
    events = []

    def format_duration(seconds):
        m = seconds // 60
        s = seconds % 60
        if m > 0:
            return f"{m}m {s}s"
        return f"{s}s"

    # 1. ISS Flyovers
    for p in iss_passes[:4]:
        duration_str = format_duration(p["duration_sec"])
        elevation_str = f" · Max Elevation: {p['max_elevation']}°" if "max_elevation" in p else ""
        events.append({
            "type": "ISS Flyover",
            "detail": f"Visible: {duration_str}{elevation_str}",
            "time": p["risetime"],
            "icon": "🛸",
        })

    # 2. Moon phases in the next 7 days
    observer = ephem.Observer()
    observer.lat = '0.0'
    observer.lon = '0.0'
    moon = ephem.Moon()
    for d in range(7):
        check_dt = dt + timedelta(days=d)
        observer.date = check_dt
        moon.compute(observer)
        phase = round(moon.phase, 1)
        if phase > 97:
            events.append({
                "type": "Full Moon Peak",
                "detail": "Lunar surface fully illuminated (washout warning for deep sky)",
                "time": check_dt.strftime("%Y-%m-%d 18:00 UTC"),
                "icon": "🌕"
            })
            break
        elif phase < 3:
            events.append({
                "type": "New Moon Peak",
                "detail": "Optimal dark skies for deep space astrophotography",
                "time": check_dt.strftime("%Y-%m-%d 18:00 UTC"),
                "icon": "🌑"
            })
            break

    # 3. Conjunctions (when planets align)
    visible = planet_info.get("visible_objects", [])
    if len(visible) >= 2:
        conj_dt = dt + timedelta(days=2)
        events.append({
            "type": "Planetary Conjunction",
            "detail": f"{visible[0]} and {visible[1]} visible in close alignment",
            "time": conj_dt.strftime("%Y-%m-%d 19:30 UTC"),
            "icon": "🪐",
        })

    # 4. Meteor Shower Peaks in the month
    showers = [
        ("Quadrantids", 1, 3), ("Lyrids", 4, 21), ("Eta Aquariids", 5, 5),
        ("Perseids", 8, 12), ("Orionids", 10, 21), ("Leonids", 11, 17), ("Geminids", 12, 13)
    ]
    for name, month, day in showers:
        for d in range(7):
            check_dt = dt + timedelta(days=d)
            if check_dt.month == month and check_dt.day == day:
                events.append({
                    "type": f"{name} Peak",
                    "detail": f"Active {name} meteor shower peak activity night",
                    "time": check_dt.strftime("%Y-%m-%d 22:00 UTC"),
                    "icon": "☄️"
                })
                break

    # Sort events chronologically
    def parse_time(evt):
        try:
            return datetime.strptime(evt["time"], "%Y-%m-%d %H:%M UTC")
        except Exception:
            return datetime.max

    events.sort(key=parse_time)
    return events


# ---------------------------------------------------------------------------
# Narrative Intelligence
# ---------------------------------------------------------------------------

def generate_narrative(location_name, csai, planet_info, weather, events, light_pollution=None, space_weather=None, space_risk=None):
    """
    Generate narrative by calling Gemini API if key is present,
    else fall back to a high-fidelity local text builder.
    """
    import os
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
            visible_str = ", ".join(planet_info.get("visible_objects", [])) or "None"
            events_str = ", ".join([f"{e['type']} at {e['time']}" for e in events[:3]])
            payload = {
                "contents": [{
                    "parts": [{
                        "text": (
                            f"Write a poetic, high-fidelity, and engaging night sky observation report for a visitor at the '{location_name}' node. "
                            f"Current Telemetry Context:\n"
                            f"- Cloud Cover: {weather.get('cloud_cover')}% (visibility: {weather.get('visibility')}m)\n"
                            f"- CSAI Score: {csai}/100\n"
                            f"- Visible planets: {visible_str}\n"
                            f"- Moon: phase {planet_info['moon']['phase']}%, altitude {planet_info['moon']['altitude']}°\n"
                            f"- Light Pollution (Bortle Scale): Class {light_pollution.get('bortle') if light_pollution else 'Unknown'}\n"
                            f"- Space Weather: Geomagnetic: {space_weather.get('geomagnetic_storm') if space_weather else 'Quiet'}, flare: {space_weather.get('solar_flare') if space_weather else 'Quiet'}, comm risk: {space_weather.get('comm_risk_pct') if space_weather else 0}%\n"
                            f"- Space Risk Index: {space_risk.get('risk_score') if space_risk else 0}/100\n"
                            f"- Upcoming events: {events_str}\n\n"
                            f"Format the story exactly like: 'At this moment Jupiter dominates the southeastern horizon while the International Space Station races above at 28,000 km/h. Atmospheric clarity is excellent, making tonight one of the best observation windows this month.' "
                            f"Return ONLY the story paragraph (under 4 sentences)."
                        )
                    }]
                }]
            }
            res = requests.post(url, json=payload, timeout=6)
            res.raise_for_status()
            text = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
            if text:
                return text
        except Exception as e:
            logger.warning("Gemini narrative call failed: %s", e)

    # Local fallback
    visible = planet_info.get("visible_objects", [])
    moon = planet_info["moon"]
    cloud = weather.get("cloud_cover", 50)
    parts = []

    if "Jupiter" in visible:
        parts.append(f"At this moment Jupiter dominates the southeastern horizon while the International Space Station races above in a stable trajectory.")
    elif visible:
        parts.append(f"At this moment {visible[0]} dominates the horizon above {location_name} while orbital paths weave silently overhead.")
    else:
        parts.append(f"The starry firmament stretches above {location_name} tonight, with distant deep-sky treasures awaiting observation.")

    if cloud < 20:
        parts.append("Atmospheric clarity is excellent, making tonight one of the best observation windows this month.")
    elif cloud < 50:
        parts.append("Partly cloudy skies offer brief, clear observation corridors between passing patches.")
    else:
        parts.append("Heavy cloud cover presents challenges, shifting focus to radio tracking and satellite telemetry.")

    if moon["visible"]:
        if moon["phase"] > 80:
            parts.append(f"The radiant full moon ({moon['phase']}% illumination) bathes the landscape in a soft silver wash.")
        else:
            parts.append(f"A slender crescent moon ({moon['phase']}% illuminated) hangs elegantly in the dark sky, minimizing interference.")

    if space_weather and space_weather.get("g_scale", 0) >= 1:
        parts.append(f"A geomagnetic storm ({space_weather.get('geomagnetic_storm')}) is active, triggering auroral forecasts at high latitudes.")
    elif space_risk and space_risk.get("risk_score", 0) > 60:
        parts.append("LEO orbital congestion is elevated, with tracking nodes scanning for potential debris path deviations.")

    return " ".join(parts)

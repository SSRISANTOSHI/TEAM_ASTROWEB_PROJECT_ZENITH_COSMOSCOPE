# COSMOSCOPE Backend

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Runs on http://localhost:5000

## Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/cosmic-data?lat=&lon=&name=` | Full cosmic analysis for a location |
| `GET /api/iss` | Live ISS position |
| `GET /health` | Health check |

# TEAM_ASTROWEB_PROJECT_ZENITH_COSMOSCOPE

PROJECT ZENITH: THE CELESTIAL EYE
COSMOSCOPE: Zenith Astronomical Digital Twin & Telemetry Hub
Team Name: AstroWeb
 
1. Project Overview
COSMOSCOPE is an immersive Astronomical Digital Twin and Live Telemetry Dashboard developed for Project Zenith: The Celestial Eye. The platform enables users to explore celestial phenomena above any location on Earth through interactive visualization, real-time satellite telemetry, astronomical predictions, and artificial intelligence-powered insights.
The system combines modern web technologies, orbital mechanics, space weather intelligence, and geospatial visualization to transform complex astronomical data into an engaging and educational user experience.
COSMOSCOPE bridges the gap between raw astrophysical information and intuitive exploration by providing a real-time cosmic radar capable of tracking orbital objects, evaluating sky conditions, and generating astronomy narratives.
 
2. Live Deployment
Frontend Application
https://team-astroweb-project-zenith-cosmos.vercel.app/
Backend API
https://team-astroweb-project-zenith-cosmoscope.onrender.com
 
3. Website Functionality and Unique Features
3.1 3D Space Digital Twin
The platform utilizes CesiumJS and Three.js to create a high-fidelity digital twin of Earth and its surrounding orbital environment.
Key Features:
• Real-time 3D Earth visualization
• International Space Station (ISS) tracking
• Orbital path projection
• Interactive location selection
• Dynamic WebGL starfield rendering
 
3.2 Cosmic Situation Awareness Index (CSAI)
COSMOSCOPE introduces a proprietary suitability scoring system that evaluates astronomical observation conditions for any selected location.
The CSAI score considers:
• Cloud coverage
• Atmospheric visibility
• Light pollution level
• Visible celestial objects
• Space weather conditions
The resulting score provides users with an overall astronomical observation suitability percentage.
 
3.3 Digital Twin Time Travel Engine
The platform enables users to analyze both historical and future astronomical conditions.
Capabilities include:
• Planet position prediction
• Lunar phase visualization
• ISS pass forecasting
• Temporal astronomical exploration
The prediction engine is powered by PyEphem orbital calculations.
 
3.4 Space Weather and Risk Monitoring
COSMOSCOPE integrates live space weather intelligence to enhance situational awareness.
Features include:
• Solar flare monitoring
• Geomagnetic storm tracking
• Aurora visibility prediction
• Communication risk estimation
• Orbital congestion assessment
 
3.5 Astrophotography Exposure Advisor
The system assists astronomy enthusiasts and photographers by recommending optimal observation and imaging parameters.
Recommendations include:
• Exposure duration
• ISO values
• Aperture settings
• Target prioritization
• Photography quality estimation
 
3.6 AI Astronomy Narrator
An AI-powered astronomy assistant generates contextual explanations for celestial events and visible astronomical objects.
Capabilities include:
• Astronomy question answering
• Constellation descriptions
• Celestial object explanations
• Space anomaly summaries
• Location-specific astronomy insights
The assistant is powered by Google's Gemini 2.5 Flash model with a deterministic fallback engine.
 
4. System Architecture
The application follows a client-server architecture.
Frontend Layer:
• React.js
• CesiumJS
• Three.js
• Resium
Backend Layer:
• Flask REST API
• PyEphem Computation Engine
• Telemetry Processing Engine
Database Layer:
• MySQL Database
External Data Sources:
• Open-Meteo
• NOAA SWPC
• CelesTrak
• Open Notify
• NASA Horizons
• Gemini AI
 
5. Concurrency and Performance Optimization
To improve responsiveness and reduce latency, the backend employs a parallel execution model using ThreadPoolExecutor.
Parallel tasks include:
1.	Weather retrieval
2.	ISS telemetry retrieval
3.	Satellite catalog retrieval
4.	Ephemeris computation
5.	ISS pass prediction
6.	Light pollution estimation
7.	Space weather monitoring
This architecture significantly reduces response time and ensures a smooth user experience.
 
6. Dependencies
Frontend Technologies
• React 18
• CesiumJS
• Resium
• Three.js
• Leaflet
• React Leaflet
• CRACO
• Copy Webpack Plugin
 
Backend Technologies
• Flask
• Flask-CORS
• PyEphem
• MySQL Connector
• Python Dotenv
• Requests
• Gunicorn
 
External APIs and Services
• Open-Meteo API
• NOAA Space Weather Prediction Center
• CelesTrak Satellite Catalog
• Open Notify API
• NASA Horizons API
• Gemini AI API
 
7. Installation and Setup Instructions
Backend Setup
1.	Navigate to the backend directory.
2.	Create and activate a Python virtual environment.
3.	Install project dependencies using requirements.txt.
4.	Configure environment variables:
DATABASE_URL
FLASK_DEBUG
FRONTEND_URL
5.	Start the Flask server.
 
Frontend Setup
1.	Navigate to the frontend directory.
2.	Install npm dependencies.
3.	Configure environment variables:
REACT_APP_API_URL
REACT_APP_CESIUM_TOKEN
4.	Start the React development server.
 
8. Technology Stack
Frontend:
React, CesiumJS, Resium, Three.js, Leaflet
Backend:
Flask, PyEphem, REST APIs
Database:
MySQL
Artificial Intelligence:
Gemini 2.5 Flash
Deployment Platforms:
Vercel, Render, Railway
 
9. Future Enhancements
Planned enhancements include:
• Real-time satellite collision visualization
• Advanced constellation mapping
• Near-Earth object tracking
• Space debris monitoring
• Personalized astronomy notifications
• Mobile application support
• Expanded AI astronomy tutoring features
 
10. Conclusion
COSMOSCOPE demonstrates the vision of Project Zenith: The Celestial Eye by transforming astronomical data into an accessible, interactive, and educational platform. Through real-time telemetry, predictive astronomy, artificial intelligence, and immersive visualization, the project enables users to explore and understand the dynamic sky above any location on Earth.



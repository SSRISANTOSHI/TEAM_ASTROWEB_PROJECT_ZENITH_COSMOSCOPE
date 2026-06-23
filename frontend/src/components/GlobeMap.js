import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'cesium/Build/Cesium/Widgets/widgets.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

async function geocode(query) {
  const r = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
    { headers: { 'Accept-Language': 'en' } }
  );
  return r.json();
}

// ── Search Bar ───────────────────────────────────────────────────────────────
function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    if (!val.trim()) { setResults([]); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await geocode(val);
        setResults(data);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
  };

  const handlePick = (item) => {
    setQuery(item.display_name.split(',')[0]);
    setResults([]);
    onSelect(parseFloat(item.lat), parseFloat(item.lon), item.display_name.split(',')[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await geocode(query);
      if (data[0]) handlePick(data[0]);
    } catch { } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: 340 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', background: 'rgba(13,17,23,0.95)', border: '1px solid #21262d', borderRadius: 10, overflow: 'visible', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
        <input
          value={query}
          onChange={handleChange}
          placeholder="Search location..."
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '10px 14px', color: '#e6edf3', fontSize: '0.85rem', minWidth: 0 }}
        />
        <button type="submit" style={{ background: 'none', border: 'none', padding: '0 14px', color: loading ? '#8b949e' : '#58a6ff', cursor: 'pointer', fontSize: '1rem' }}>
          {loading ? '⏳' : '🔍'}
        </button>
      </form>
      {results.length > 0 && (
        <div style={{ background: 'rgba(13,17,23,0.97)', border: '1px solid #21262d', borderRadius: 10, marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {results.map((r) => (
            <button
              key={r.place_id}
              onClick={() => handlePick(r)}
              style={{ display: 'block', width: '100%', background: 'none', border: 'none', borderBottom: '1px solid #21262d', padding: '9px 14px', color: '#e6edf3', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,166,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              📍 {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Leaflet 2D Map ───────────────────────────────────────────────────────────
function LeafletMap({ onLocationSelect, selectedLocation, issPosition, flyTo }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const selectedMarkerRef = useRef(null);
  const issMarkerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(containerRef.current, { center: [20, 0], zoom: 2, zoomControl: true });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
    }).addTo(map);
    map.on('click', (e) => onLocationSelect(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to searched location
  useEffect(() => {
    if (!mapRef.current || !flyTo) return;
    mapRef.current.flyTo([flyTo.lat, flyTo.lon], 10, { duration: 1.5 });
  }, [flyTo]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedMarkerRef.current) { selectedMarkerRef.current.remove(); selectedMarkerRef.current = null; }
    if (!selectedLocation) return;
    const icon = L.divIcon({
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#58a6ff;border:2px solid #fff;box-shadow:0 0 10px rgba(88,166,255,0.9)"></div>',
      className: '', iconSize: [14, 14], iconAnchor: [7, 7],
    });
    selectedMarkerRef.current = L.marker([selectedLocation.lat, selectedLocation.lon], { icon })
      .bindPopup(`<strong>${selectedLocation.name}</strong><br/>${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lon.toFixed(4)}`)
      .addTo(mapRef.current);
  }, [selectedLocation]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (issMarkerRef.current) { issMarkerRef.current.remove(); issMarkerRef.current = null; }
    if (!issPosition) return;
    const icon = L.divIcon({ html: '<div class="iss-marker-icon">🛸</div>', className: '', iconSize: [28, 28], iconAnchor: [14, 14] });
    issMarkerRef.current = L.marker([issPosition.lat, issPosition.lon], { icon })
      .bindPopup(`<strong>🛸 ISS</strong><br/>${issPosition.lat.toFixed(2)}°, ${issPosition.lon.toFixed(2)}°`)
      .addTo(mapRef.current);
  }, [issPosition]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#030712' }} />;
}

const SATELLITE_TEMPLATES = [
  { name: 'STARLINK-30241', altitude: 550, inclination: 53.2, raan: 45, period: 5700, color: '#00ffc8', op: 'SpaceX', country: 'USA', purpose: 'Internet Communication', launch: '2022-11-14', status: 'Active' },
  { name: 'SENTINEL-6A', altitude: 1336, inclination: 66.0, raan: 120, period: 6700, color: '#d1bcdf', op: 'ESA', country: 'ESA/Europe', purpose: 'Earth Observation', launch: '2020-11-21', status: 'Active' },
  { name: 'COSMOS 2542', altitude: 370, inclination: 97.9, raan: 210, period: 5500, color: '#ffb4ab', op: 'Roscosmos', country: 'Russia', purpose: 'Military Navigation', launch: '2019-12-25', status: 'Deviated' },
  { name: 'ONEWEB-0422', altitude: 1200, inclination: 87.9, raan: 310, period: 6600, color: '#00ffc8', op: 'Eutelsat OneWeb', country: 'UK', purpose: 'Internet Communication', launch: '2021-07-01', status: 'Active' },
  { name: 'GPS III-SV05', altitude: 20200, inclination: 55.0, raan: 15, period: 43200, color: '#ffe170', op: 'US Space Force', country: 'USA', purpose: 'Navigation', launch: '2021-06-18', status: 'Active' },
  { name: 'TIANGONG', altitude: 389, inclination: 41.5, raan: 85, period: 5500, color: '#00ffc8', op: 'CNSA', country: 'China', purpose: 'Scientific Research', launch: '2021-04-29', status: 'Active' },
  { name: 'METEOR-M2', altitude: 825, inclination: 98.8, raan: 175, period: 6000, color: '#ffe170', op: 'Roscosmos', country: 'Russia', purpose: 'Weather Observation', launch: '2019-07-05', status: 'Active' },
  { name: 'NOAA-19', altitude: 870, inclination: 98.7, raan: 265, period: 6100, color: '#ffe170', op: 'NOAA', country: 'USA', purpose: 'Weather Observation', launch: '2009-02-06', status: 'Active' },
  { name: 'LANDSAT 8', altitude: 705, inclination: 98.2, raan: 335, period: 5900, color: '#d1bcdf', op: 'NASA / USGS', country: 'USA', purpose: 'Earth Observation', launch: '2013-02-11', status: 'Active' },
  { name: 'HUBBLE', altitude: 540, inclination: 28.5, raan: 50, period: 5700, color: '#d1bcdf', op: 'NASA / ESA', country: 'USA', purpose: 'Scientific / Astronomy', launch: '1990-04-24', status: 'Active' }
];

function getSatellitePosition(altitude, inclination, raan, periodSeconds) {
  const earthRadius = 6378137; // WGS84 Semi-major axis (meters)
  const r = earthRadius + altitude * 1000;
  
  // Angle changes with time
  const timeSec = Date.now() / 1000;
  const angle = (timeSec / periodSeconds) * 2.0 * Math.PI;
  
  const radInclination = (inclination * Math.PI) / 180;
  const radRaan = (raan * Math.PI) / 180;
  
  // Position in orbital plane
  const xp = r * Math.cos(angle);
  const yp = r * Math.sin(angle);
  
  // Rotate by inclination and RAAN
  const x = xp * Math.cos(radRaan) - yp * Math.sin(radRaan) * Math.cos(radInclination);
  const y = xp * Math.sin(radRaan) + yp * Math.cos(radRaan) * Math.cos(radInclination);
  const z = yp * Math.sin(radInclination);
  
  return { x, y, z };
}

// ── Cesium 3D Globe ──────────────────────────────────────────────────────────
function CesiumGlobe({ onLocationSelect, onSatSelect, selectedLocation, issPosition, onFallback, flyTo }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const issEntityRef = useRef(null);
  const selectedEntityRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const Cesium = await import('cesium');
        Cesium.Ion.defaultAccessToken = process.env.REACT_APP_CESIUM_TOKEN;

        const viewer = new Cesium.Viewer(containerRef.current, {
          baseLayerPicker: false, geocoder: false, homeButton: false,
          sceneModePicker: false, navigationHelpButton: false,
          animation: false, timeline: false, fullscreenButton: false,
          infoBox: false, selectionIndicator: false,
          terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        });

        try {
          const imagery = await Cesium.createWorldImageryAsync();
          viewer.imageryLayers.addImageryProvider(imagery);
        } catch { /* keep default */ }

        viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#030712');
        viewer.scene.globe.enableLighting = true;
        viewerRef.current = viewer;

        // Draw satellites and orbits
        SATELLITE_TEMPLATES.forEach(sat => {
          // Orbit line
          const orbitPositions = [];
          const r = 6378137 + sat.altitude * 1000;
          const radIncl = (sat.inclination * Math.PI) / 180;
          const radRaan = (sat.raan * Math.PI) / 180;

          for (let deg = 0; deg <= 360; deg += 5) {
            const angle = (deg * Math.PI) / 180;
            const xp = r * Math.cos(angle);
            const yp = r * Math.sin(angle);
            const x = xp * Math.cos(radRaan) - yp * Math.sin(radRaan) * Math.cos(radIncl);
            const y = xp * Math.sin(radRaan) + yp * Math.cos(radRaan) * Math.cos(radIncl);
            const z = yp * Math.sin(radIncl);
            orbitPositions.push(new Cesium.Cartesian3(x, y, z));
          }

          viewer.entities.add({
            polyline: {
              positions: orbitPositions,
              width: 1.2,
              material: Cesium.Color.fromCssColorString(sat.color).withAlpha(0.2),
            }
          });

          // Satellite moving point
          viewer.entities.add({
            position: new Cesium.CallbackProperty((time, result) => {
              const pos = getSatellitePosition(sat.altitude, sat.inclination, sat.raan, sat.period);
              return Cesium.Cartesian3.fromElements(pos.x, pos.y, pos.z, result);
            }, false),
            point: {
              pixelSize: 8,
              color: Cesium.Color.fromCssColorString(sat.color),
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1.5,
            },
            label: {
              text: sat.name,
              font: '10px monospace',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1.5,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -14),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            properties: {
              satelliteData: new Cesium.ConstantProperty({
                name: sat.name,
                operator: sat.op,
                purpose: sat.purpose,
                country: sat.country,
                altitude: sat.altitude,
                inclination: sat.inclination,
                status: sat.status
              })
            }
          });
        });

        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((click) => {
          const pickedObject = viewer.scene.pick(click.position);
          if (Cesium.defined(pickedObject) && pickedObject.id) {
            const entity = pickedObject.id;
            if (entity.properties && entity.properties.satelliteData) {
              const satData = entity.properties.satelliteData.getValue();
              onSatSelect(satData);
              return;
            }
          }

          const ray = viewer.camera.getPickRay(click.position);
          const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
          if (cartesian) {
            const carto = Cesium.Cartographic.fromCartesian(cartesian);
            onLocationSelect(Cesium.Math.toDegrees(carto.latitude), Cesium.Math.toDegrees(carto.longitude));
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      } catch (err) {
        console.warn('Cesium init failed:', err);
        onFallback && onFallback();
      }
    })();
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to searched location + immediately place marker
  useEffect(() => {
    if (!flyTo) return;
    const tryFly = async () => {
      // Wait until viewer is ready
      let attempts = 0;
      while (!viewerRef.current && attempts < 20) {
        await new Promise(r => setTimeout(r, 200));
        attempts++;
      }
      if (!viewerRef.current) return;
      try {
        const Cesium = await import('cesium');
        const viewer = viewerRef.current;

        // Fly camera
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(flyTo.lon, flyTo.lat, 1500000),
          duration: 2,
        });

        // Place marker immediately (don't wait for selectedLocation prop)
        if (selectedEntityRef.current) viewer.entities.remove(selectedEntityRef.current);
        selectedEntityRef.current = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(flyTo.lon, flyTo.lat, 0),
          label: { text: `📍 ${flyTo.name}`, font: '13px sans-serif', fillColor: Cesium.Color.fromCssColorString('#58a6ff'), outlineColor: Cesium.Color.BLACK, outlineWidth: 2, style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(0, -18), disableDepthTestDistance: Number.POSITIVE_INFINITY },
          point: { pixelSize: 10, color: Cesium.Color.fromCssColorString('#58a6ff'), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
        });
      } catch (e) { /* silent */ }
    };
    tryFly();
  }, [flyTo]);

  useEffect(() => {
    if (!viewerRef.current || !issPosition) return;
    (async () => {
      try {
        const Cesium = await import('cesium');
        const viewer = viewerRef.current;
        if (issEntityRef.current) viewer.entities.remove(issEntityRef.current);
        issEntityRef.current = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(issPosition.lon, issPosition.lat, 408000),
          label: { text: '🛸 ISS', font: '14px sans-serif', fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK, outlineWidth: 2, style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(0, -20), disableDepthTestDistance: Number.POSITIVE_INFINITY },
          point: { pixelSize: 10, color: Cesium.Color.CYAN, outlineColor: Cesium.Color.WHITE, outlineWidth: 1 },
        });
      } catch (e) { /* silent */ }
    })();
  }, [issPosition]);

  useEffect(() => {
    if (!viewerRef.current || !selectedLocation) return;
    (async () => {
      try {
        const Cesium = await import('cesium');
        const viewer = viewerRef.current;
        if (selectedEntityRef.current) viewer.entities.remove(selectedEntityRef.current);
        selectedEntityRef.current = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(selectedLocation.lon, selectedLocation.lat, 0),
          label: { text: `📍 ${selectedLocation.name}`, font: '13px sans-serif', fillColor: Cesium.Color.fromCssColorString('#58a6ff'), outlineColor: Cesium.Color.BLACK, outlineWidth: 2, style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(0, -18), disableDepthTestDistance: Number.POSITIVE_INFINITY },
          point: { pixelSize: 10, color: Cesium.Color.fromCssColorString('#58a6ff'), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
        });
      } catch (e) { /* silent */ }
    })();
  }, [selectedLocation]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />;
}

// ── Public component ──────────────────────────────────────────────────────────
export default function GlobeMap({ onLocationSelect, selectedLocation, issPosition }) {
  const [mode, setMode] = useState('3d');
  const [flyTo, setFlyTo] = useState(null);
  const [selectedSat, setSelectedSat] = useState(null);

  const handleSearchSelect = useCallback((lat, lon, name) => {
    setFlyTo({ lat, lon, name });
    onLocationSelect(lat, lon);
  }, [onLocationSelect]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {mode === '3d' && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <CesiumGlobe
            onLocationSelect={onLocationSelect}
            onSatSelect={setSelectedSat}
            selectedLocation={selectedLocation}
            issPosition={issPosition}
            onFallback={() => setMode('2d')}
            flyTo={flyTo}
          />
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, visibility: mode === '2d' ? 'visible' : 'hidden', pointerEvents: mode === '2d' ? 'all' : 'none' }}>
        <LeafletMap
          onLocationSelect={onLocationSelect}
          selectedLocation={selectedLocation}
          issPosition={issPosition}
          flyTo={flyTo}
        />
      </div>

      <SearchBar onSelect={handleSearchSelect} />

      {selectedSat && (
        <div className="glass-panel" style={{ position: 'absolute', top: 80, right: 16, zIndex: 1000, width: 280, padding: 16, background: 'rgba(13,17,23,0.92)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#e6edf3', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8, marginBottom: 12 }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent)' }}>{selectedSat.name}</h4>
              <span style={{ fontSize: '0.65rem', color: '#8b949e' }}>ORBIT INSPECTOR</span>
            </div>
            <button onClick={() => setSelectedSat(null)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b949e' }}>OPERATOR:</span><span style={{ fontWeight: 'bold' }}>{selectedSat.operator}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b949e' }}>PURPOSE:</span><span style={{ color: 'var(--accent2)', textAlign: 'right', fontWeight: 'bold' }}>{selectedSat.purpose}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b949e' }}>COUNTRY:</span><span style={{ fontWeight: 'bold' }}>{selectedSat.country}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b949e' }}>ALTITUDE:</span><span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{selectedSat.altitude} km</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b949e' }}>INCLINATION:</span><span style={{ fontWeight: 'bold' }}>{selectedSat.inclination}°</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b949e' }}>STATUS:</span><span style={{ fontWeight: 'bold', fontSize: '0.7rem', padding: '1px 6px', borderRadius: 4, background: selectedSat.status === 'Active' ? 'rgba(0, 255, 200, 0.1)' : 'rgba(255, 180, 171, 0.1)', color: selectedSat.status === 'Active' ? 'var(--accent)' : 'var(--warn)' }}>{selectedSat.status}</span></div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000, display: 'flex', background: 'rgba(13,17,23,0.92)', border: '1px solid #21262d', borderRadius: 10, overflow: 'hidden', backdropFilter: 'blur(8px)' }}>
        {[{ id: '3d', label: '🌍 3D Globe' }, { id: '2d', label: '🗺 2D Map' }].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setMode(opt.id)}
            style={{ padding: '7px 16px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: 'none', letterSpacing: '0.04em', background: mode === opt.id ? 'rgba(88,166,255,0.18)' : 'transparent', color: mode === opt.id ? '#58a6ff' : '#8b949e', borderRight: opt.id === '3d' ? '1px solid #21262d' : 'none', transition: 'all 0.2s' }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

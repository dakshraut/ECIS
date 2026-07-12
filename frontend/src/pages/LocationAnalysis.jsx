import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Database, Info, ListChecks, LocateFixed, MapPin, Newspaper, Radar, ShieldCheck } from 'lucide-react';
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import RiskMeter from '@components/RiskMeter';
import { analyzeLocation } from '@services/api';

function LocationPicker({ latitude, longitude, onPick, active }) {
  const map = useMapEvents({
    click(event) {
      onPick(event.latlng.lat.toFixed(6), event.latlng.lng.toFixed(6));
    },
  });

  useEffect(() => {
    if (active && latitude && longitude) {
      map.setView([Number(latitude), Number(longitude)], Math.max(map.getZoom(), 8), { animate: true });
    }
  }, [active, latitude, longitude, map]);

  if (!latitude || !longitude) {
    return null;
  }

  return (
    <CircleMarker
      center={[Number(latitude), Number(longitude)]}
      radius={11}
      pathOptions={{
        color: '#34d399',
        fillColor: '#34d399',
        fillOpacity: 0.85,
        weight: 3,
      }}
    />
  );
}

export default function LocationAnalysis() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 78]);
  const [mapKey, setMapKey] = useState(0);
  const [hasSelectedPoint, setHasSelectedPoint] = useState(false);

  const syncSelection = (nextLatitude, nextLongitude) => {
    const lat = Number(nextLatitude);
    const lon = Number(nextLongitude);

    if (Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      setMapCenter([lat, lon]);
      setHasSelectedPoint(true);
      setMapKey((value) => value + 1);
      return true;
    }

    setHasSelectedPoint(false);
    return false;
  };

  const handleAnalyze = async () => {
    if (!latitude || !longitude) {
      setError('Please enter coordinates or select a point on the map.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeLocation(Number(latitude), Number(longitude));
      setResult(data);
      syncSelection(latitude, longitude);
    } catch (err) {
      setError(err.response?.data?.detail || 'Location analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePick = (lat, lon) => {
    setLatitude(lat);
    setLongitude(lon);
    syncSelection(lat, lon);
    setError(null);
  };

  const mapReady = useMemo(() => Boolean(latitude && longitude), [latitude, longitude]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Location Analysis</h1>
        <p className="text-gray-400">
          Analyze environmental crime risk from coordinates and regional geospatial signals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="xl:col-span-3 rounded-lg border border-emerald-500/20 bg-gray-800/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Select Location</h2>
              <p className="text-sm text-gray-400">Click the map or enter exact coordinates.</p>
            </div>
          </div>

          <div className="h-[28rem] overflow-hidden rounded-lg border border-gray-700">
            <MapContainer key={mapKey} center={mapCenter} zoom={5} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker latitude={latitude} longitude={longitude} onPick={handlePick} active={mapReady && hasSelectedPoint} />
            </MapContainer>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-gray-300">Latitude</span>
              <input
                type="number"
                value={latitude}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setLatitude(nextValue);
                  if (nextValue !== '' && longitude !== '') {
                    syncSelection(nextValue, longitude);
                  }
                }}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white outline-none transition focus:border-emerald-400"
                placeholder="-3.4653"
                step="any"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-gray-300">Longitude</span>
              <input
                type="number"
                value={longitude}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setLongitude(nextValue);
                  if (nextValue !== '' && latitude !== '') {
                    syncSelection(latitude, nextValue);
                  }
                }}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white outline-none transition focus:border-emerald-400"
                placeholder="-62.2159"
                step="any"
              />
            </label>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Radar size={18} />
            {loading ? 'Analyzing location...' : 'Analyze Environmental Risk'}
          </button>
        </section>

        <section className="xl:col-span-2 rounded-lg border border-emerald-500/20 bg-gray-800/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Analysis Results</h2>
              <p className="text-sm text-gray-400">Risk, likely crime type, and response guidance.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              <RiskMeter score={result.risk_score} />

              {typeof result.data_confidence === 'number' && (
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-semibold text-cyan-100">
                      <Database size={18} />
                      Data Confidence
                    </div>
                    <span className="text-lg font-bold text-cyan-200">{result.data_confidence}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-900/70">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{ width: `${result.data_confidence}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-gray-900/70 p-4">
                <p className="text-sm text-gray-400">Predicted Crime Type</p>
                <p className="mt-1 text-xl font-semibold text-white">{result.crime_display_name}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-900/70 p-4">
                  <p className="text-xs text-gray-400">Region</p>
                  <p className="mt-1 font-semibold text-white">{result.region_name}</p>
                </div>
                <div className="rounded-lg bg-gray-900/70 p-4">
                  <p className="text-xs text-gray-400">Land Use</p>
                  <p className="mt-1 font-semibold text-white">{result.land_use_type}</p>
                </div>
              </div>

              <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 p-4">
                <div className="mb-2 flex items-center gap-2 font-semibold text-blue-200">
                  <AlertTriangle size={18} />
                  Recommended Action
                </div>
                <p className="text-sm text-blue-100">{result.recommendations?.immediate_action}</p>
                <p className="mt-2 text-xs text-blue-200/80">Notify: {result.recommendations?.notify}</p>
                <p className="mt-1 text-xs text-blue-200/80">Response: {result.recommendations?.response_time}</p>
              </div>

              {result.nearby_hotspots?.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                    <LocateFixed size={18} />
                    Nearby Hotspots
                  </div>
                  <div className="space-y-2">
                    {result.nearby_hotspots.map((hotspot) => (
                      <div key={hotspot.id || hotspot.name} className="flex items-center justify-between gap-3 rounded-lg bg-gray-900/70 p-3">
                        <span className="text-sm text-white">{hotspot.name}</span>
                        <span className={hotspot.severity === 'critical' ? 'text-sm text-red-300' : 'text-sm text-amber-300'}>
                          {hotspot.distance_km} km
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.evidence_items?.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                    <ListChecks size={18} />
                    Evidence Used
                  </div>
                  <div className="space-y-2">
                    {result.evidence_items.slice(0, 6).map((item, idx) => (
                      <div key={`${item.label}-${idx}`} className="rounded-lg bg-gray-900/70 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{item.label}</p>
                            <p className="mt-1 text-xs text-gray-300">{item.value}</p>
                          </div>
                          {typeof item.nearest_km === 'number' && (
                            <span className="text-xs text-emerald-300">{item.nearest_km} km</span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">{item.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.environmental_news && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-200">
                    <Newspaper size={18} />
                    News Signal
                  </div>
                  <p className="text-sm text-emerald-100">{result.environmental_news}</p>
                </div>
              )}

              {result.data_sources?.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                    <Database size={18} />
                    Data Sources
                  </div>
                  <div className="space-y-2">
                    {result.data_sources.map((source) => (
                      <div key={source.name} className="flex items-center justify-between gap-3 rounded-lg bg-gray-900/70 p-3">
                        <span className="text-sm text-white">{source.name}</span>
                        <span className={source.status === 'available' ? 'text-xs text-emerald-300' : 'text-xs text-red-300'}>
                          {source.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.accuracy_note && (
                <div className="rounded-lg border border-gray-600 bg-gray-900/70 p-4">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-gray-200">
                    <Info size={18} />
                    Accuracy Note
                  </div>
                  <p className="text-sm text-gray-300">{result.accuracy_note}</p>
                </div>
              )}
            </div>
          ) : (
            !error && (
              <div className="flex min-h-[24rem] items-center justify-center rounded-lg border border-dashed border-gray-700 text-center text-gray-400">
                Select a location and run analysis to view geospatial risk intelligence.
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
}

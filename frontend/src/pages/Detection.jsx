import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AlertTriangle, Database, ListChecks, LocateFixed, MapPin, Radar } from 'lucide-react';
import RiskMeter from '@components/RiskMeter';
import { analyzeLocation } from '@services/api';
import { crimeTypeColors, formatCoordinates, formatCrimeType, severityColors } from '../utils/constants';

const examples = [
  { label: 'Logging', latitude: '-3.4653', longitude: '-62.2159' },
  { label: 'Mining', latitude: '-25', longitude: '-50' },
  { label: 'Water', latitude: '5.3176', longitude: '6.4678' },
  { label: 'Land', latitude: '14.4974', longitude: '-14.4524' },
];

export default function Detection() {
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    locationName: '',
    address: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const setExample = (example) => {
    setFormData((current) => ({
      ...current,
      latitude: example.latitude,
      longitude: example.longitude,
      locationName: `${example.label} test area`,
    }));
    setError(null);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        toast.success('Location retrieved');
      },
      () => toast.error('Unable to retrieve location')
    );
  };

  const handleDetect = async (event) => {
    event.preventDefault();
    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError('Please enter valid latitude and longitude values.');
      return;
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setError('Coordinates are outside the valid latitude/longitude range.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeLocation(latitude, longitude);
      setResult(data);
      toast.success('Crime detection analysis complete');
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.detail || 'Location analysis failed.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const crimeTone = crimeTypeColors[result?.crime_type_prediction] || crimeTypeColors.none;
  const severityBadge = severityColors[result?.severity]?.badge || severityColors.none.badge;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="mb-2 text-4xl font-bold text-neon-green">Crime Detection</h1>
        <p className="text-gray-400">Analyze coordinates for environmental crimes</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          whileHover={{ borderColor: 'rgba(0, 255, 255, 0.3)' }}
          className="card lg:col-span-1"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neon-green">
            <MapPin className="h-5 w-5" />
            <span>Location Input</span>
          </h3>

          <form onSubmit={handleDetect} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Location Name</span>
              <input
                type="text"
                name="locationName"
                value={formData.locationName}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Amazon Rainforest"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-300">Latitude</span>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="-3.4653"
                  min="-90"
                  max="90"
                  step="any"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-300">Longitude</span>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="-62.2159"
                  min="-180"
                  max="180"
                  step="any"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Address</span>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Amazon Basin, Brazil"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              {examples.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => setExample(example)}
                  className="rounded-lg border border-emerald-500/30 px-3 py-2 text-sm text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/10"
                >
                  {example.label}
                </button>
              ))}
            </div>

            <button type="button" onClick={handleUseCurrentLocation} className="w-full btn-secondary">
              Use Current Location
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Radar size={18} />
              {loading ? 'Analyzing...' : 'Analyze Location'}
            </button>
          </form>
        </motion.div>

        <div className="lg:col-span-2">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className={`card border-2 ${crimeTone.border}`}>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Predicted Crime Type</p>
                    <h3 className={`mt-1 text-2xl font-bold ${crimeTone.text}`}>
                      {result.crime_display_name || formatCrimeType(result.crime_type_prediction)}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">{result.region_name}</p>
                  </div>
                  <span className={`badge ${severityBadge}`}>{result.risk_level}</span>
                </div>

                <RiskMeter score={result.risk_score} />

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-dark-700/30 p-3">
                    <p className="mb-1 text-xs text-gray-400">Data Confidence</p>
                    <p className="text-xl font-bold text-neon-cyan">{result.data_confidence || 0}%</p>
                  </div>
                  <div className="rounded-lg bg-dark-700/30 p-3">
                    <p className="mb-1 text-xs text-gray-400">Land Use</p>
                    <p className="text-lg font-bold capitalize text-neon-green">{result.land_use_type?.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="rounded-lg bg-dark-700/30 p-3">
                    <p className="mb-1 text-xs text-gray-400">Location</p>
                    <p className="text-sm font-bold text-neon-cyan">
                      {formatCoordinates(result.coordinates.lat, result.coordinates.lon)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-blue-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{result.recommendations?.immediate_action || 'Review evidence and monitor the area.'}</span>
                  </p>
                  {result.recommendations?.notify && (
                    <p className="mt-2 text-xs text-blue-200/80">Notify: {result.recommendations.notify}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="card">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">
                    <Database className="h-4 w-4 text-neon-cyan" />
                    Spectral Evidence
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {['ndvi', 'ndwi', 'ndbi'].map((index) => (
                      <div key={index} className="rounded-lg bg-dark-700/30 p-3">
                        <p className="text-xs uppercase text-gray-400">{index}</p>
                        <p className="mt-1 font-bold text-white">{result.spectral_indices?.[index] ?? 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-gray-500">Source: {result.satellite_source || 'geospatial signals'}</p>
                </div>

                <div className="card">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">
                    <LocateFixed className="h-4 w-4 text-neon-green" />
                    Nearby Hotspots
                  </h4>
                  {result.nearby_hotspots?.length > 0 ? (
                    <div className="space-y-2">
                      {result.nearby_hotspots.slice(0, 3).map((hotspot) => (
                        <div key={hotspot.id || hotspot.name} className="flex justify-between gap-3 rounded-lg bg-dark-700/30 p-3">
                          <span className="text-sm text-white">{hotspot.name}</span>
                          <span className="text-sm text-emerald-300">{hotspot.distance_km} km</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No curated hotspots nearby.</p>
                  )}
                </div>
              </div>

              {result.evidence_items?.length > 0 && (
                <div className="card">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">
                    <ListChecks className="h-4 w-4 text-neon-green" />
                    Evidence Used
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {result.evidence_items.slice(0, 6).map((item, idx) => (
                      <div key={`${item.label}-${idx}`} className="rounded-lg bg-dark-700/30 p-3">
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="mt-1 text-xs text-gray-300">{item.value}</p>
                        <p className="mt-2 text-xs text-gray-500">{item.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            !loading && (
              <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-lg border border-dashed border-emerald-500/20 bg-gray-800/30 text-center text-gray-400">
                <AlertTriangle className="mb-4 h-12 w-12 opacity-50" />
                <p>Enter coordinates and click Analyze Location to begin detection.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

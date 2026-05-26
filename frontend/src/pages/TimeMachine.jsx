import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, FileText, Layers, LocateFixed, MapPin, Radar, TrendingDown, TrendingUp } from 'lucide-react';
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import 'leaflet/dist/leaflet.css';
import { runTimeMachine } from '@services/api';

const presets = [
  { label: 'Amazon', lat: '-3.4653', lon: '-62.2159' },
  { label: 'Yamuna', lat: '28.7041', lon: '77.1025' },
  { label: 'Niger Delta', lat: '5.3176', lon: '6.4678' },
  { label: 'Sahel', lat: '14.4974', lon: '-14.4524' },
];

function PickerMarker({ latitude, longitude, onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat.toFixed(6), event.latlng.lng.toFixed(6));
    },
  });

  if (!latitude || !longitude) {
    return null;
  }

  return (
    <CircleMarker
      center={[Number(latitude), Number(longitude)]}
      radius={10}
      pathOptions={{
        color: '#22d3ee',
        fillColor: '#10b981',
        fillOpacity: 0.8,
        weight: 3,
      }}
    />
  );
}

const trendTone = {
  rising: {
    icon: TrendingUp,
    text: 'text-red-300',
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
  },
  declining: {
    icon: TrendingDown,
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
  },
  stable: {
    icon: Layers,
    text: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/40',
  },
};

export default function TimeMachine() {
  const [latitude, setLatitude] = useState('28.7041');
  const [longitude, setLongitude] = useState('77.1025');
  const [years, setYears] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tone = trendTone[result?.trend] || trendTone.stable;
  const TrendIcon = tone.icon;

  const chartData = useMemo(() => result?.snapshots || [], [result]);

  const handlePick = (lat, lon) => {
    setLatitude(lat);
    setLongitude(lon);
    setError(null);
  };

  const handleRun = async () => {
    if (!latitude || !longitude) {
      setError('Select a map point or enter coordinates.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await runTimeMachine(Number(latitude), Number(longitude), Number(years));
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Time Machine analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Environmental Time Machine</h1>
          <p className="mt-2 max-w-3xl text-gray-400">
            Reconstruct a modeled risk timeline, evidence trail, and case brief for any location.
          </p>
        </div>
        {result && (
          <div className={`rounded-lg border ${tone.border} ${tone.bg} px-4 py-3`}>
            <div className={`flex items-center gap-2 text-sm font-semibold uppercase ${tone.text}`}>
              <TrendIcon size={18} />
              {result.trend} {result.risk_delta >= 0 ? '+' : ''}{result.risk_delta} risk
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-6 xl:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
              <CalendarClock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Choose a Place and Window</h2>
              <p className="text-sm text-gray-400">Click the map or start from a known hotspot.</p>
            </div>
          </div>

          <div className="h-72 overflow-hidden rounded-lg border border-gray-700">
            <MapContainer center={[20, 78]} zoom={3} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <PickerMarker latitude={latitude} longitude={longitude} onPick={handlePick} />
            </MapContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label>
              <span className="mb-2 block text-sm text-gray-300">Latitude</span>
              <input
                type="number"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white outline-none transition focus:border-emerald-400"
                step="any"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm text-gray-300">Longitude</span>
              <input
                type="number"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white outline-none transition focus:border-emerald-400"
                step="any"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm text-gray-300">Lookback Window: {years} years</span>
            <input
              type="range"
              min="2"
              max="10"
              value={years}
              onChange={(event) => setYears(event.target.value)}
              className="w-full accent-emerald-400"
            />
          </label>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePick(preset.lat, preset.lon)}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 transition hover:border-emerald-400/60"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleRun}
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Radar size={18} />
            {loading ? 'Reconstructing timeline...' : 'Run Time Machine'}
          </button>
        </section>

        <section className="space-y-6 xl:col-span-3">
          {result ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-4">
                  <p className="text-xs text-gray-400">Region</p>
                  <p className="mt-1 font-semibold text-white">{result.region_name}</p>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-4">
                  <p className="text-xs text-gray-400">Current Risk</p>
                  <p className="mt-1 text-2xl font-bold text-white">{result.current_risk_score}</p>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-4">
                  <p className="text-xs text-gray-400">Primary Signal</p>
                  <p className="mt-1 font-semibold text-white">{result.crime_display_name}</p>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-4">
                  <p className="text-xs text-gray-400">Confidence</p>
                  <p className="mt-1 text-2xl font-bold text-cyan-300">{result.data_confidence}%</p>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-6">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
                  <Layers size={20} className="text-emerald-300" />
                  Risk Reconstruction
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="year" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ background: '#111827', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 8 }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="risk_score" name="Risk" stroke="#34d399" fill="url(#riskFill)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-6">
                  <h2 className="mb-5 text-lg font-semibold text-white">Index Drift</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                        <XAxis dataKey="year" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ background: '#111827', border: '1px solid rgba(34,211,238,0.35)', borderRadius: 8 }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="vegetation_health" name="Vegetation" stroke="#22c55e" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="water_quality" name="Water" stroke="#22d3ee" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="disturbance_index" name="Disturbance" stroke="#f97316" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-6">
                  <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
                    <FileText size={20} className="text-cyan-300" />
                    Generated Case Brief
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Headline</p>
                      <p className="mt-1 font-semibold text-white">{result.case_brief.headline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Summary</p>
                      <p className="mt-1 text-sm leading-6 text-gray-200">{result.case_brief.summary}</p>
                    </div>
                    <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3">
                      <p className="text-sm font-semibold text-cyan-100">{result.case_brief.recommended_next_step}</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-500">{result.case_brief.confidence_note}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-6">
                <h2 className="mb-5 text-lg font-semibold text-white">Evidence Timeline</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {result.key_events.map((event) => (
                    <div key={`${event.year}-${event.title}`} className="rounded-lg bg-gray-900/70 p-4">
                      <p className="text-sm font-bold text-emerald-300">{event.year}</p>
                      <p className="mt-2 font-semibold text-white">{event.title}</p>
                      <p className="mt-2 text-sm leading-5 text-gray-300">{event.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {result.nearby_hotspots?.length > 0 && (
                <div className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <LocateFixed size={20} className="text-emerald-300" />
                    Hotspot Context
                  </h2>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {result.nearby_hotspots.slice(0, 4).map((hotspot) => (
                      <div key={hotspot.id || hotspot.name} className="flex items-center justify-between gap-4 rounded-lg bg-gray-900/70 p-3">
                        <div>
                          <p className="font-semibold text-white">{hotspot.name}</p>
                          <p className="text-xs text-gray-400">{hotspot.crime_display_name}</p>
                        </div>
                        <span className="text-sm text-emerald-300">{hotspot.distance_km} km</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex min-h-[42rem] flex-col items-center justify-center rounded-lg border border-dashed border-emerald-500/20 bg-gray-800/30 text-center">
              <MapPin className="mb-4 h-12 w-12 text-emerald-300/70" />
              <p className="text-lg font-semibold text-white">Pick a location to reconstruct its environmental story.</p>
              <p className="mt-2 max-w-xl text-sm text-gray-400">
                The timeline will combine current risk evidence, land-use context, hotspot proximity, and deterministic historical modeling.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

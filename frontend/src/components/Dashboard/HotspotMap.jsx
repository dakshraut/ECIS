import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { geoApi } from '@services/api';
import LoadingSpinner from '@components/Common/LoadingSpinner';
import { formatCrimeType } from '@utils/constants';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#10b981',
};

const DEFAULT_CENTER = [20, 0];

export default function HotspotMap() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [hasCentered, setHasCentered] = useState(false);

  const fetchHotspots = useCallback(async () => {
    try {
      const response = await geoApi.get('/hotspots');
      const hotspotsData = response.data?.hotspots || response.data?.data || [];
      setHotspots(hotspotsData);
      setError(false);

      if (!hasCentered && hotspotsData.length > 0) {
        setCenter([hotspotsData[0].latitude || DEFAULT_CENTER[0], hotspotsData[0].longitude || DEFAULT_CENTER[1]]);
        setHasCentered(true);
      }
    } catch (err) {
      console.error('Failed to fetch hotspots:', err);
      setHotspots([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [hasCentered]);

  useEffect(() => {
    fetchHotspots();
    const interval = window.setInterval(fetchHotspots, 10000);
    return () => window.clearInterval(interval);
  }, [fetchHotspots]);

  const markerData = useMemo(() => hotspots.slice(0, 80), [hotspots]);

  if (loading) {
    return (
      <div className="map-card h-[460px] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Crime Hotspots Map</h3>
            <p className="mt-1 text-sm text-slate-400">Loading live incident data…</p>
          </div>
        </div>
        <div className="flex h-[320px] items-center justify-center rounded-xl border border-emerald-500/15 bg-slate-950/40">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="map-card p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Crime Hotspots Map</h3>
          <p className="mt-1 text-sm text-slate-400">Live environmental crime clusters and severity trends.</p>
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
          {hotspots.length} active hotspots
        </div>
      </div>

      {error || hotspots.length === 0 ? (
        <div className="map-empty-state h-[360px]">
          No hotspot data is currently available. Try refreshing in a moment.
        </div>
      ) : (
        <div className="relative h-[360px] overflow-hidden rounded-xl border border-emerald-500/20">
          <MapContainer
            center={center}
            zoom={3}
            zoomControl={false}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {markerData.map((hotspot, idx) => {
              const severity = (hotspot.severity || 'low').toLowerCase();
              const fillColor = SEVERITY_COLORS[severity] || SEVERITY_COLORS.low;
              const radius = severity === 'critical' ? 12 : severity === 'high' ? 10 : 8;

              return (
                <CircleMarker
                  key={`${hotspot.latitude || idx}-${hotspot.longitude || idx}`}
                  center={[hotspot.latitude || 0, hotspot.longitude || 0]}
                  radius={radius}
                  fillColor={fillColor}
                  color={fillColor}
                  weight={2}
                  opacity={0.9}
                  fillOpacity={0.65}
                >
                  <Popup>
                    <div className="text-xs text-slate-700">
                      <p className="font-semibold text-slate-900">
                        {hotspot.region_name || hotspot.name || hotspot.location_name || 'Hotspot'}
                      </p>
                      <p className="mt-1">Type: {hotspot.crime_display_name || formatCrimeType(hotspot.crime_type)}</p>
                      <p>Reports: {hotspot.reports_count || 0}</p>
                      <p className="capitalize">Severity: {severity}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          <div className="map-legend">
            <div className="mb-1 font-semibold text-emerald-300">Legend</div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Critical
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> High
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> Medium
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Low
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

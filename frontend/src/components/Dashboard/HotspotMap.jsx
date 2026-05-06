import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { api } from '@services/api';
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

export default function HotspotMap() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([20, 0]);

  useEffect(() => {
    fetchHotspots();
    const interval = setInterval(fetchHotspots, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchHotspots = async () => {
    try {
      const response = await api.get('/hotspots');
      const hotspotsData = response.data?.hotspots || response.data?.data || [];
      setHotspots(hotspotsData);
      
      // Center map on first hotspot if available
      if (hotspotsData.length > 0) {
        setCenter([hotspotsData[0].latitude || 20, hotspotsData[0].longitude || 0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch hotspots:', err);
      setHotspots([]);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-800/50 border border-emerald-500/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Crime Hotspots Map</h3>

      <MapContainer
        center={center}
        zoom={4}
        className="w-full h-96 rounded-lg border border-emerald-500/20"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hotspots.map((hotspot, idx) => (
          <CircleMarker
            key={idx}
            center={[hotspot.latitude || 0, hotspot.longitude || 0]}
            radius={hotspot.severity === 'critical' ? 14 : hotspot.severity === 'high' ? 11 : 8}
            fillColor={SEVERITY_COLORS[hotspot.severity] || SEVERITY_COLORS.low}
            color={SEVERITY_COLORS[hotspot.severity] || SEVERITY_COLORS.low}
            weight={2}
            opacity={0.8}
            fillOpacity={0.6}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-bold">{hotspot.region_name || hotspot.name || hotspot.location_name || 'Hotspot'}</p>
                <p>Type: {hotspot.crime_display_name || formatCrimeType(hotspot.crime_type)}</p>
                <p>Reports: {hotspot.reports_count || 0}</p>
                <p className="capitalize">Severity: {hotspot.severity || 'Unknown'}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="mt-4 text-xs text-gray-400">
        <p>Total hotspots: {hotspots.length}</p>
      </div>
    </div>
  );
}

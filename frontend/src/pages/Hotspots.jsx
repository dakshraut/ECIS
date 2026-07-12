import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet';
import { crimeService } from '../services/api';
import { crimeTypeColors } from '../utils/constants';
import { Map, Layers } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFetch } from '@/hooks';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

export default function Hotspots() {
  const [selectedCrimeTypes, setSelectedCrimeTypes] = useState(new Set());

  // Fetch hotspots using useFetch hook
  const { data: hotspotsResponse, loading } = useFetch(
    () => crimeService.getHotspots(),
    []
  );

  const hotspots = useMemo(() => hotspotsResponse?.hotspots || hotspotsResponse?.data || [], [hotspotsResponse]);

  useEffect(() => {
    if (hotspots.length > 0 && selectedCrimeTypes.size === 0) {
      const crimeTypes = new Set(hotspots.map((h) => h.crime_type));
      setSelectedCrimeTypes(crimeTypes);
    }
  }, [hotspots, selectedCrimeTypes.size]);

  // Calculate map center
  const mapCenter = useMemo(() => {
    if (hotspots.length === 0) return [0, 0];
    const avgLat = hotspots.reduce((sum, h) => sum + h.latitude, 0) / hotspots.length;
    const avgLng = hotspots.reduce((sum, h) => sum + h.longitude, 0) / hotspots.length;
    return [avgLat, avgLng];
  }, [hotspots]);

  const handleCrimeTypeToggle = (crimeType) => {
    const newSelected = new Set(selectedCrimeTypes);
    if (newSelected.has(crimeType)) {
      newSelected.delete(crimeType);
    } else {
      newSelected.add(crimeType);
    }
    setSelectedCrimeTypes(newSelected);
  };

  const filteredHotspots = useMemo(
    () => hotspots.filter((h) => selectedCrimeTypes.has(h.crime_type)),
    [hotspots, selectedCrimeTypes]
  );

  const crimeTypeStats = useMemo(() => {
    return hotspots.reduce((acc, h) => {
      if (!acc[h.crime_type]) {
        acc[h.crime_type] = 0;
      }
      acc[h.crime_type]++;
      return acc;
    }, {});
  }, [hotspots]);

  const getMarkerIcon = (crimeType) => {
    const color = crimeTypeColors[crimeType]?.text?.split('-')[1];
    const colorMap = {
      red: '#ff0000',
      orange: '#ff8800',
      blue: '#0099ff',
      yellow: '#ffdd00',
      purple: '#ff00ff',
      gray: '#888888',
    };

    return L.divIcon({
      className: 'custom-icon',
      html: `<div style="background-color: ${colorMap[color] || '#00ff88'}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${colorMap[color] || '#00ff88'};"></div>`,
      iconSize: [24, 24],
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold text-neon-green mb-2">Crime Hotspots</h1>
          <p className="text-gray-400">Environmental crime detection hotspots worldwide</p>
        </div>
        <div className="glass-dark px-4 py-2 rounded-lg flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse" />
          <span className="text-sm text-gray-300">{filteredHotspots.length} Active</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Crime Type Filter */}
        <motion.div
          whileHover={{ borderColor: 'rgba(0, 255, 255, 0.3)' }}
          className="card max-h-96 overflow-auto"
        >
          <h3 className="text-lg font-semibold text-neon-green mb-4 flex items-center space-x-2">
            <Layers className="w-5 h-5" />
            <span>Crime Types</span>
          </h3>

          <div className="space-y-2">
            {Object.entries(crimeTypeStats).map(([crimeType, count]) => (
              <motion.button
                key={crimeType}
                whileHover={{ x: 5 }}
                onClick={() => handleCrimeTypeToggle(crimeType)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  selectedCrimeTypes.has(crimeType)
                    ? 'bg-neon-green/20 border border-neon-green/50'
                    : 'bg-dark-700/30 border border-gray-700/50 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCrimeTypes.has(crimeType)}
                    onChange={() => {}}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="capitalize text-sm">{crimeType.replace(/_/g, ' ')}</span>
                </div>
                <span className="text-xs font-semibold text-neon-cyan">{count}</span>
              </motion.button>
            ))}
          </div>

          {/* Statistics */}
          <div className="mt-6 pt-6 border-t border-neon-cyan/20 space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Total Hotspots</p>
              <p className="text-2xl font-bold text-neon-green">{hotspots.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Active (Filtered)</p>
              <p className="text-2xl font-bold text-neon-cyan">{filteredHotspots.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-3 card p-0 overflow-hidden"
        >
          <MapContainer
            center={mapCenter}
            zoom={4}
            style={{ height: '600px', width: '100%' }}
            className="z-10"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {filteredHotspots.map((hotspot) => (
              <React.Fragment key={`${hotspot.latitude}-${hotspot.longitude}`}>
                {/* Marker */}
                <Marker
                  position={[hotspot.latitude, hotspot.longitude]}
                  icon={getMarkerIcon(hotspot.crime_type)}
                >
                  <Popup>
                    <div className="text-dark-900 text-sm">
                      <p className="font-bold">{hotspot.name}</p>
                      <p className="text-xs mt-1">
                        <strong>Type:</strong> {hotspot.crime_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs">
                        <strong>Severity:</strong> {hotspot.severity}
                      </p>
                      <p className="text-xs">
                        <strong>Last Detected:</strong> {new Date(hotspot.last_detected).toLocaleDateString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>

                {/* Heat Circle */}
                <Circle
                  center={[hotspot.latitude, hotspot.longitude]}
                  radius={50000}
                  pathOptions={{
                    color: crimeTypeColors[hotspot.crime_type]?.text?.includes('red')
                      ? '#ff0000'
                      : crimeTypeColors[hotspot.crime_type]?.text?.includes('orange')
                        ? '#ff8800'
                        : crimeTypeColors[hotspot.crime_type]?.text?.includes('blue')
                          ? '#0099ff'
                          : crimeTypeColors[hotspot.crime_type]?.text?.includes('yellow')
                            ? '#ffdd00'
                            : '#00ff88',
                    fillOpacity: hotspot.severity === 'critical' ? 0.4 : hotspot.severity === 'high' ? 0.3 : 0.2,
                    weight: 2,
                  }}
                />
              </React.Fragment>
            ))}
          </MapContainer>
        </motion.div>
      </div>

      {/* Hotspots List */}
      <motion.div
        whileHover={{ borderColor: 'rgba(0, 255, 255, 0.3)' }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-neon-green mb-4 flex items-center space-x-2">
          <Map className="w-5 h-5" />
          <span>Hotspot Details</span>
        </h3>

        {filteredHotspots.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hotspots match your selection</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-auto">
            {filteredHotspots.map((hotspot) => (
              <motion.div
                key={`${hotspot.latitude}-${hotspot.longitude}`}
                whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 255, 0.5)' }}
                className={`p-4 rounded-lg border ${crimeTypeColors[hotspot.crime_type]?.border} bg-dark-700/30 cursor-pointer transition-all`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-neon-green text-sm">{hotspot.name}</h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    hotspot.severity === 'critical'
                      ? 'bg-red-900/30 text-red-400'
                      : hotspot.severity === 'high'
                        ? 'bg-orange-900/30 text-orange-400'
                        : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {hotspot.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2 capitalize">
                  {hotspot.crime_type.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-gray-500">
                  Last Detected: {new Date(hotspot.last_detected).toLocaleDateString()}
                </p>
                <p className="text-xs text-neon-cyan mt-2">
                  {hotspot.latitude.toFixed(4)}°, {hotspot.longitude.toFixed(4)}°
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

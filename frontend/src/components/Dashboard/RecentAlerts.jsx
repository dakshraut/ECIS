import React, { useEffect, useState } from 'react';
import { geoApi } from '@services/api';
import LoadingSpinner from '@components/Common/LoadingSpinner';

const SEVERITY_COLORS = {
  critical: 'bg-red-500/20 border-red-500/50 text-red-400',
  high: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
  medium: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  low: 'bg-green-500/20 border-green-500/50 text-green-400',
};

export default function RecentAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await geoApi.get('/reports?limit=5&sort=-timestamp');
      setAlerts(response.data?.reports || response.data?.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setAlerts([]);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-800/50 border border-emerald-500/20 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg">🔔</span>
        <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">No recent alerts</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-4 ${
                SEVERITY_COLORS[alert.severity] ||
                'bg-gray-700/50 border-gray-600 text-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm capitalize">
                    {alert.crime_display_name || alert.crime_type || 'Unknown'} Detected
                  </p>
                  <p className="text-xs opacity-80 mt-1">
                    {alert.description || alert.environmental_news || 'Crime detection alert'}
                  </p>
                  <p className="text-xs opacity-60 mt-2">
                    {new Date(alert.created_at || alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

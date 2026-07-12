import { useState, useEffect } from 'react';
import { geoApi } from '@services/api';

export const useRealTimeStats = (refreshInterval = 10000) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await geoApi.get('/stats');
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        // Set default empty stats
        setStats({
          total_reports: 0,
          critical_crimes: 0,
          active_hotspots: 0,
          avg_risk_score: 0,
          total_area_affected: 0,
          response_rate: 0,
          crimes_by_type: {},
          severity_distribution: {},
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { stats, loading, error };
};

export default useRealTimeStats;

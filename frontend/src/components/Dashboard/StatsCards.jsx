import React, { useEffect, useState } from 'react';
import { geoApi } from '@services/api';
import LoadingSpinner from '@components/Common/LoadingSpinner';

const STAT_EMOJI = {
  reports: '📊',
  crimes: '⚠️',
  hotspots: '🌍',
  risk: '📈',
};

export default function StatsCards() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await geoApi.get('/stats');
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      // Set mock data if API fails
      setStats({
        total_reports: 0,
        critical_crimes: 0,
        active_hotspots: 0,
        avg_risk_score: 0,
        total_area_affected: 0,
        response_rate: 0,
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const cards = [
    {
      title: 'Total Reports',
      value: stats?.total_reports || 0,
      unit: 'reports',
      color: 'from-emerald-500 to-emerald-600',
      icon: 'reports',
      trend: '+12%',
    },
    {
      title: 'Critical Crimes',
      value: stats?.critical_crimes || 0,
      unit: 'active',
      color: 'from-red-500 to-red-600',
      icon: 'crimes',
      trend: '+5%',
    },
    {
      title: 'Active Hotspots',
      value: stats?.active_hotspots || 0,
      unit: 'zones',
      color: 'from-yellow-500 to-yellow-600',
      icon: 'hotspots',
      trend: '-3%',
    },
    {
      title: 'Avg Risk Score',
      value: (stats?.avg_risk_score || 0).toFixed(1),
      unit: '/100',
      color: 'from-cyan-500 to-cyan-600',
      icon: 'risk',
      trend: '+8%',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const emoji = STAT_EMOJI[card.icon];
        return (
          <div
            key={idx}
            className="bg-gray-800/50 border border-emerald-500/20 rounded-lg p-6 hover:border-emerald-500/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.unit}</p>
              </div>
              <div className="text-4xl">{emoji}</div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-emerald-500/10">
              <span className="text-xs text-emerald-400 font-semibold">{card.trend}</span>
              <span className="text-xs text-gray-500">vs last week</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

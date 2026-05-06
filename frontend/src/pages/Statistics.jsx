import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@components/Common/LoadingSpinner';
import useRealTimeStats from '@hooks/useRealTimeStats';
import { environmentalCrimeTypes } from '@utils/constants';

const buildCrimeBreakdown = (counts = {}) => {
  const total = environmentalCrimeTypes.reduce((sum, crime) => sum + (counts[crime.id] || 0), 0);

  return environmentalCrimeTypes.map((crime) => {
    const count = counts[crime.id] || 0;
    return {
      ...crime,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
};

export default function Statistics() {
  const { stats, loading } = useRealTimeStats();
  const crimesByType = stats?.crime_type_distribution || stats?.crimes_by_type || {};
  const crimeBreakdown = useMemo(() => buildCrimeBreakdown(crimesByType), [crimesByType]);
  const totalSignals = crimeBreakdown.reduce((sum, crime) => sum + crime.count, 0);
  const responseRate = `${Number(stats?.response_rate || 0).toFixed(1)}%`;

  if (loading) {
    return <LoadingSpinner />;
  }

  const overviewCards = [
    { label: 'Total Signals', value: totalSignals, color: 'emerald' },
    { label: 'Critical Crimes', value: stats?.critical_crimes || 0, color: 'cyan' },
    { label: 'Active Hotspots', value: stats?.active_hotspots || 0, color: 'yellow' },
    { label: 'Response Rate', value: responseRate, color: 'purple' },
  ];

  const topRegions = [
    { name: 'Amazon Rainforest', count: crimesByType.illegal_logging || 0, severity: 'critical' },
    { name: 'Brazil Mining Region', count: crimesByType.illegal_mining || 0, severity: 'critical' },
    { name: 'Niger Delta Waterways', count: crimesByType.water_pollution || 0, severity: 'high' },
    { name: 'Sahel Land Degradation Belt', count: crimesByType.land_degradation || 0, severity: 'high' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 space-y-2"
      >
        <h1 className="text-4xl font-bold text-white">Statistics</h1>
        <p className="text-gray-400">Detailed analytics across environmental crime categories</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {overviewCards.map((stat) => {
          const colorMap = {
            emerald: 'from-emerald-500 to-emerald-600',
            cyan: 'from-cyan-500 to-cyan-600',
            yellow: 'from-yellow-500 to-yellow-600',
            purple: 'from-purple-500 to-purple-600',
          };

          return (
            <div
              key={stat.label}
              className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div
                  className={`h-12 w-12 rounded-lg bg-gradient-to-br ${colorMap[stat.color]}`}
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <div className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Crimes by Type</h3>
          <div className="space-y-3">
            {crimeBreakdown.map((crime) => (
              <div key={crime.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-300">{crime.label}</span>
                  <span className="font-semibold text-emerald-400">{crime.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-700/50">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                    style={{ width: `${crime.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Top Regions</h3>
          <div className="space-y-3">
            {topRegions.map((region) => {
              const severityColors = {
                critical: 'bg-red-500/20 border-red-500/50 text-red-400',
                high: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
                medium: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
                low: 'bg-green-500/20 border-green-500/50 text-green-400',
              };

              return (
                <div
                  key={region.name}
                  className="flex items-center justify-between rounded-lg bg-gray-700/50 p-3"
                >
                  <div>
                    <p className="font-semibold text-white">{region.name}</p>
                    <p className="text-xs text-gray-400">{region.count} signals</p>
                  </div>
                  <span className={`rounded border px-2 py-1 text-xs font-semibold ${severityColors[region.severity]}`}>
                    {region.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-6"
      >
        <h3 className="mb-6 text-lg font-semibold text-white">Detection Timeline</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-400">
            Live reports: <span className="font-semibold text-emerald-400">{stats?.total_reports || 0}</span>
          </p>
          <p className="text-gray-400">
            Average risk score: <span className="font-semibold text-emerald-400">{Number(stats?.avg_risk_score || 0).toFixed(1)}</span>
          </p>
          <p className="text-gray-400">
            Data refreshes every <span className="font-semibold text-emerald-400">10 seconds</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

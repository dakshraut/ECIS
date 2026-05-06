import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '@services/api';
import LoadingSpinner from '@components/Common/LoadingSpinner';
import { environmentalCrimeTypes, formatCrimeType } from '@utils/constants';

const buildCrimeTypeRows = (counts = {}) => environmentalCrimeTypes.map((crime) => ({
  name: crime.label,
  count: counts[crime.id] || 0,
}));

export default function CrimeTypeChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrimeData();
    const interval = setInterval(fetchCrimeData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchCrimeData = async () => {
    try {
      const response = await api.get('/stats');
      const crimesByType = response.data?.crime_type_distribution || response.data?.crimes_by_type || {};
      const knownRows = buildCrimeTypeRows(crimesByType);
      const knownIds = new Set(environmentalCrimeTypes.map((crime) => crime.id));
      const extraRows = Object.entries(crimesByType)
        .filter(([type]) => !knownIds.has(type))
        .map(([type, count]) => ({ name: formatCrimeType(type), count }));

      setData([...knownRows, ...extraRows]);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch crime data:', err);
      setData(buildCrimeTypeRows());
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-800/50 border border-emerald-500/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Crime Type Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1f3a',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
            }}
            cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
          />
          <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

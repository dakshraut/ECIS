import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { geoApi } from '@services/api';
import LoadingSpinner from '@components/Common/LoadingSpinner';

export default function TrendsChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
    const interval = setInterval(fetchTrendData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrendData = async () => {
    try {
      const response = await geoApi.get('/reports?limit=1000');
      const reports = response.data?.reports || response.data?.data || [];

      // Group reports by day
      const dayMap = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dayMap[key] = 0;
      }

      // Count reports per day
      reports.forEach((report) => {
        const date = new Date(report.created_at || report.timestamp);
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dayMap.hasOwnProperty(key)) {
          dayMap[key]++;
        }
      });

      const chartData = Object.entries(dayMap).map(([date, count]) => ({
        name: date,
        crimes: count,
      }));

      setData(chartData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch trend data:', err);
      // Provide default data structure
      const today = new Date();
      const defaultData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        defaultData.push({
          name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          crimes: 0,
        });
      }
      setData(defaultData);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-800/50 border border-emerald-500/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Crime Trends (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1f3a',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
            }}
            cursor={{ stroke: 'rgba(16, 185, 129, 0.3)' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="crimes"
            stroke="#10b981"
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

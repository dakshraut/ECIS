import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { geoApi } from '@services/api';
import LoadingSpinner from '@components/Common/LoadingSpinner';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981'];

export default function RiskLevelChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskData();
    const interval = setInterval(fetchRiskData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRiskData = async () => {
    try {
      const response = await geoApi.get('/stats');
      const riskData = response.data?.severity_distribution || response.data?.risk_distribution || {};
      
      const chartData = [
        { name: 'Critical', value: riskData.critical || 0 },
        { name: 'High', value: riskData.high || 0 },
        { name: 'Medium', value: riskData.medium || 0 },
        { name: 'Low', value: riskData.low || 0 },
      ];
      
      setData(chartData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch risk data:', err);
      setData([
        { name: 'Critical', value: 0 },
        { name: 'High', value: 0 },
        { name: 'Medium', value: 0 },
        { name: 'Low', value: 0 },
      ]);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-800/50 border border-emerald-500/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Risk Level Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1f3a',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

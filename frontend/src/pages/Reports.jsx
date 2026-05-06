import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ChevronDown, Download, Filter, Search } from 'lucide-react';
import LoadingSpinner from '@components/Common/LoadingSpinner';
import { crimeService } from '@services/api';
import {
  crimeTypeColors,
  environmentalCrimeTypes,
  formatCrimeType,
  formatDate,
  getRiskLevelColor,
  getRiskLevelLabel,
  severityColors,
} from '../utils/constants';

const getReportLocation = (report) => {
  if (report.region_name) return report.region_name;
  if (report.location?.address) return report.location.address;
  if (report.location?.latitude !== undefined && report.location?.longitude !== undefined) {
    return `${Number(report.location.latitude).toFixed(4)}, ${Number(report.location.longitude).toFixed(4)}`;
  }
  return 'Unknown location';
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    crimeType: '',
    severity: '',
    minRisk: '',
    maxRisk: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchReports = async () => {
      try {
        const response = await crimeService.getReports();
        if (!mounted) return;
        setReports(response.data?.reports || []);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        const message = err.response?.data?.message || err.message || 'Unable to load reports.';
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReports();
    const interval = setInterval(fetchReports, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredReports = useMemo(() => {
    const minRisk = filters.minRisk === '' ? 0 : Number(filters.minRisk);
    const maxRisk = filters.maxRisk === '' ? 100 : Number(filters.maxRisk);
    const search = searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      const crimeType = report.crime_type || report.crime_type_prediction || 'unknown';
      const severity = report.severity || 'none';
      const riskScore = Number(report.risk_score || 0);
      const haystack = [
        report.report_id,
        crimeType,
        report.crime_display_name,
        getReportLocation(report),
        report.land_use,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (!filters.crimeType || crimeType === filters.crimeType) &&
        (!filters.severity || severity === filters.severity) &&
        riskScore >= minRisk &&
        riskScore <= maxRisk &&
        (!search || haystack.includes(search))
      );
    });
  }, [filters, reports, searchTerm]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleExport = () => {
    const csv = [
      ['Report ID', 'Crime Type', 'Severity', 'Risk Score', 'Confidence', 'Location', 'Land Use', 'Detected At'],
      ...filteredReports.map((report) => [
        report.report_id,
        formatCrimeType(report.crime_type || report.crime_type_prediction),
        report.severity || '',
        report.risk_score ?? '',
        report.data_confidence ?? '',
        getReportLocation(report),
        report.land_use || report.land_use_type || '',
        formatDate(report.timestamp),
      ]),
    ]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ecis_reports_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="mb-2 text-4xl font-bold text-neon-green">Crime Reports</h1>
          <p className="text-gray-400">Search and filter detected environmental crimes</p>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredReports.length === 0}
          className="flex items-center gap-2 btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </motion.div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="card flex items-center gap-3">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by crime type, location, land use, or report ID..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="flex-1 bg-transparent text-gray-300 placeholder-gray-500 focus:outline-none"
          />
        </div>

        <button
          onClick={() => setShowFilters((current) => !current)}
          className="card flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2 text-neon-green">
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="card grid grid-cols-1 gap-4 md:grid-cols-4"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Crime Type</span>
              <select name="crimeType" value={filters.crimeType} onChange={handleFilterChange} className="input-field">
                <option value="">All Types</option>
                {environmentalCrimeTypes.map((crime) => (
                  <option key={crime.id} value={crime.id}>{crime.label}</option>
                ))}
                <option value="no_crime">No Crime Detected</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Severity</span>
              <select name="severity" value={filters.severity} onChange={handleFilterChange} className="input-field">
                <option value="">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="none">None</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Min Risk Score</span>
              <input
                type="number"
                name="minRisk"
                value={filters.minRisk}
                onChange={handleFilterChange}
                className="input-field"
                min="0"
                max="100"
                placeholder="0"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Max Risk Score</span>
              <input
                type="number"
                name="maxRisk"
                value={filters.maxRisk}
                onChange={handleFilterChange}
                className="input-field"
                min="0"
                max="100"
                placeholder="100"
              />
            </label>
          </motion.div>
        )}
      </div>

      <div className="card overflow-x-auto">
        {filteredReports.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p>No reports found matching your criteria</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neon-cyan/20">
                <th className="px-4 py-3 text-left font-semibold text-neon-green">Crime Type</th>
                <th className="px-4 py-3 text-left font-semibold text-neon-green">Location</th>
                <th className="px-4 py-3 text-center font-semibold text-neon-green">Risk Score</th>
                <th className="px-4 py-3 text-center font-semibold text-neon-green">Confidence</th>
                <th className="px-4 py-3 text-center font-semibold text-neon-green">Severity</th>
                <th className="px-4 py-3 text-right font-semibold text-neon-green">Detected At</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, index) => {
                const crimeType = report.crime_type || report.crime_type_prediction || 'unknown';
                const tone = crimeTypeColors[crimeType] || crimeTypeColors.none;
                const severityBadge = severityColors[report.severity]?.badge || severityColors.none.badge;

                return (
                  <motion.tr
                    key={report.report_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(0, 255, 136, 0.05)' }}
                    className="border-b border-neon-cyan/10 transition-all hover:border-neon-cyan/30"
                  >
                    <td className="px-4 py-3">
                      <span className={`badge border ${tone.border}`}>
                        {report.crime_display_name || formatCrimeType(crimeType)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-100">{getReportLocation(report)}</p>
                      <p className="text-xs text-gray-500">{report.land_use || 'unknown land use'}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className={`font-bold ${getRiskLevelColor(report.risk_score)}`}>{Number(report.risk_score || 0).toFixed(1)}</p>
                      <p className="text-xs text-gray-400">{getRiskLevelLabel(report.risk_score)}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="font-semibold text-neon-cyan">{report.data_confidence ?? 0}%</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${severityBadge}`}>{report.severity || 'none'}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      {formatDate(report.timestamp)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const crimeTypeColors = {
  illegal_logging: { bg: 'bg-red-900', text: 'text-red-400', border: 'border-red-500' },
  illegal_mining: { bg: 'bg-orange-900', text: 'text-orange-400', border: 'border-orange-500' },
  water_pollution: { bg: 'bg-blue-900', text: 'text-blue-400', border: 'border-blue-500' },
  land_degradation: { bg: 'bg-yellow-900', text: 'text-yellow-400', border: 'border-yellow-500' },
  ecosystem_damage: { bg: 'bg-purple-900', text: 'text-purple-400', border: 'border-purple-500' },
  none: { bg: 'bg-gray-900', text: 'text-gray-400', border: 'border-gray-500' },
};

export const environmentalCrimeTypes = [
  { id: 'illegal_mining', label: 'Illegal Mining' },
  { id: 'illegal_logging', label: 'Illegal Logging' },
  { id: 'water_pollution', label: 'Water Pollution' },
  { id: 'land_degradation', label: 'Land Degradation' },
];

export const formatCrimeType = (crimeType) => {
  const knownType = environmentalCrimeTypes.find((type) => type.id === crimeType);
  return knownType?.label || String(crimeType || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const severityColors = {
  critical: { bg: 'bg-red-900', text: 'text-red-400', badge: 'badge-critical' },
  high: { bg: 'bg-orange-900', text: 'text-orange-400', badge: 'badge-high' },
  medium: { bg: 'bg-yellow-900', text: 'text-yellow-400', badge: 'badge-medium' },
  low: { bg: 'bg-green-900', text: 'text-green-400', badge: 'badge-low' },
  none: { bg: 'bg-gray-900', text: 'text-gray-400', badge: 'badge-none' },
};

export const statusColors = {
  detected: 'text-yellow-400',
  investigating: 'text-orange-400',
  resolved: 'text-green-400',
  false_alarm: 'text-gray-400',
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCoordinates = (lat, lng) => {
  return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
};

export const getRiskLevelColor = (riskScore) => {
  if (riskScore >= 80) return 'text-red-400';
  if (riskScore >= 60) return 'text-orange-400';
  if (riskScore >= 40) return 'text-yellow-400';
  return 'text-green-400';
};

export const getRiskLevelLabel = (riskScore) => {
  if (riskScore >= 80) return 'Critical';
  if (riskScore >= 60) return 'High';
  if (riskScore >= 40) return 'Medium';
  return 'Low';
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [20, 0],
  DEFAULT_ZOOM: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  ANALYZE_LOCATION: '/analyze-location',
  NEARBY_HOTSPOTS: '/hotspots/nearby',
  SUBMIT_REPORT: '/reports/submit',
  REGION_INFO: '/region/info',
  STATS: '/stats',
  HOTSPOTS: '/hotspots',
  REPORTS: '/reports',
};

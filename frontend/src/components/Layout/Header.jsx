import React, { useEffect, useState } from 'react';

export default function Header() {
  const [time, setTime] = useState(new Date());
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const [backendHealth, aiHealth] = await Promise.all([
          fetch('http://localhost:5000/api/health'),
          fetch('http://127.0.0.1:8000/health'),
        ]);
        setApiStatus(backendHealth.ok && aiHealth.ok ? 'active' : 'error');
      } catch {
        setApiStatus('error');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-gray-900/80 backdrop-blur-lg border-b border-emerald-500/20 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <h2 className="text-xl font-bold text-white">Environmental Crime Intelligence System</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Time Display */}
        <div className="flex items-center gap-2 text-gray-300">
          <span className="text-lg">🕐</span>
          <span className="text-sm font-mono">
            {time.toLocaleTimeString()}
          </span>
        </div>

        {/* API Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              apiStatus === 'active'
                ? 'bg-emerald-400 animate-pulse'
                : apiStatus === 'checking'
                  ? 'bg-yellow-400 animate-pulse'
                  : 'bg-red-400'
            }`}
          ></div>
          <span className="text-xs text-gray-400">
            {apiStatus === 'active' ? 'Active' : apiStatus === 'checking' ? 'Checking' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}

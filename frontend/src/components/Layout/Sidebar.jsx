import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { emoji: 'LA', label: 'Location Analysis', path: '/analyze' },
  { emoji: 'TM', label: 'Time Machine', path: '/time-machine' },
  { emoji: 'DB', label: 'Dashboard', path: '/dashboard' },
  { emoji: 'CD', label: 'Crime Detection', path: '/detection' },
  { emoji: 'RP', label: 'Reports', path: '/reports' },
  { emoji: 'HS', label: 'Hotspots', path: '/hotspots' },
  { emoji: 'ST', label: 'Statistics', path: '/statistics' },
  { emoji: 'SE', label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-emerald-500/20 bg-gradient-to-b from-gray-900 via-emerald-900 to-gray-900 backdrop-blur-lg">
      <div className="border-b border-emerald-500/20 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 text-sm font-black text-gray-950">
            EC
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">ECIS</h1>
            <p className="text-xs text-emerald-400">Environmental Crime</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300
                ${(
                  isActive
                    ? 'border border-emerald-500/50 bg-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-500/20'
                    : 'text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-300'
                )}
              `}
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-gray-950/40 text-xs font-bold">
                {item.emoji}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-emerald-500/20 p-4">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="text-center text-xs text-emerald-400">
            Environmental Crime Intelligence System
          </p>
        </div>
      </div>
    </div>
  );
}

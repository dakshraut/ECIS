import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@components/Layout/MainLayout';
import ErrorBoundary from '@components/Common/ErrorBoundary';
import LoadingSpinner from '@components/Common/LoadingSpinner';
import '@styles/index.css';

// Lazy load pages
const LocationAnalysis = lazy(() => import('@pages/LocationAnalysis'));
const Dashboard = lazy(() => import('@pages/Dashboard'));
const CrimeDetection = lazy(() => import('@pages/Detection'));
const TimeMachine = lazy(() => import('@pages/TimeMachine'));
const Reports = lazy(() => import('@pages/Reports'));
const Hotspots = lazy(() => import('@pages/Hotspots'));
const Statistics = lazy(() => import('@pages/Statistics'));
const Settings = lazy(() => import('@pages/Settings'));
const Login = lazy(() => import('@pages/Login'));
const Register = lazy(() => import('@pages/Register'));

function App() {
  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Suspense fallback={<LoadingSpinner fullScreen />}><Login /></Suspense>} />
          <Route path="/register" element={<Suspense fallback={<LoadingSpinner fullScreen />}><Register /></Suspense>} />

          {/* Protected Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Suspense fallback={<LoadingSpinner fullScreen />}><Dashboard /></Suspense>} />
            <Route path="/dashboard" element={<Suspense fallback={<LoadingSpinner fullScreen />}><Dashboard /></Suspense>} />
            <Route path="/analyze" element={<Suspense fallback={<LoadingSpinner fullScreen />}><LocationAnalysis /></Suspense>} />
            <Route path="/time-machine" element={<Suspense fallback={<LoadingSpinner fullScreen />}><TimeMachine /></Suspense>} />
            <Route path="/satellite" element={<Navigate to="/analyze" replace />} />
            <Route path="/detection" element={<Suspense fallback={<LoadingSpinner fullScreen />}><CrimeDetection /></Suspense>} />
            <Route path="/reports" element={<Suspense fallback={<LoadingSpinner fullScreen />}><Reports /></Suspense>} />
            <Route path="/hotspots" element={<Suspense fallback={<LoadingSpinner fullScreen />}><Hotspots /></Suspense>} />
            <Route path="/statistics" element={<Suspense fallback={<LoadingSpinner fullScreen />}><Statistics /></Suspense>} />
            <Route path="/settings" element={<Suspense fallback={<LoadingSpinner fullScreen />}><Settings /></Suspense>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

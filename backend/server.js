const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables FIRST
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const violationRoutes = require('./routes/violationRoutes');
const aiIntegrationRoutes = require('./routes/aiIntegrationRoutes');
const geospatialRoutes = require('./routes/geospatialRoutes');
const connectDB = require('./config/db');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request Body:', req.body);
  }
  next();
});

// ==================== DATABASE CONNECTION ====================
connectDB().catch((err) => {
  console.error('⚠️ Database bootstrap failed:', err.message);
});

// ==================== ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/ai-integration', aiIntegrationRoutes);
app.use('/api/v1', geospatialRoutes);

// Compatibility endpoints for the frontend expecting /api/* paths
app.get('/api/stats', (req, res) => {
  res.status(200).json({
    success: true,
    stats: {
      total_hotspots: 0,
      active_reports: 0,
      risk_level: 'low',
    },
  });
});

app.get('/api/hotspots', (req, res) => {
  res.status(200).json({
    success: true,
    hotspots: [],
    count: 0,
  });
});

app.get('/api/reports', (req, res) => {
  res.status(200).json({
    success: true,
    reports: [],
    count: 0,
  });
});

// ==================== HEALTH CHECK ENDPOINTS ====================
// Health endpoint for frontend
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'ECIS API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      violations: {
        getAll: 'GET /api/violations',
        create: 'POST /api/violations',
        analytics: 'GET /api/violations/analytics'
      },
      aiIntegration: {
        healthCheck: 'GET /api/ai-integration/health',
        detectCrime: 'POST /api/ai-integration/detect',
        batchDetect: 'POST /api/ai-integration/batch-detect',
        getHotspots: 'GET /api/ai-integration/hotspots',
        getStats: 'GET /api/ai-integration/stats',
        getReports: 'GET /api/ai-integration/reports',
        receiveWebhook: 'POST /api/ai-integration/webhook'
      }
    }
  });
});

// Test endpoint
app.post('/test', (req, res) => {
  console.log('Test endpoint hit with body:', req.body);
  res.json({ 
    success: true, 
    message: 'Test endpoint working',
    receivedData: req.body 
  });
});

// ==================== ERROR HANDLING ====================
// 404 handler - FIXED: removed '*'
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: `Cannot ${req.method} ${req.originalUrl}`,
    note: 'Please check the available endpoints at GET /'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== START SERVER ====================
const PORT = Number(process.env.PORT) || 5000;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(50) + '\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = 5001;
      console.error(`⚠️ Port ${port} is already in use. Trying fallback port ${fallbackPort}...`);
      server.close(() => startServer(fallbackPort));
    } else {
      console.error('❌ Failed to start server:', err.message);
      process.exit(1);
    }
  });

  return server;
};

const server = startServer(PORT);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;

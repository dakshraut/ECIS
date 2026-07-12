const express = require('express');
const axios = require('axios');

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const AI_SERVICE_TIMEOUT = 30000;

const proxyRequest = async (req, res, method, path) => {
  const targetUrl = `${AI_SERVICE_URL}${path}`;

  try {
    const response = await axios({
      method,
      url: targetUrl,
      params: req.query,
      data: req.body,
      timeout: AI_SERVICE_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 502;
    const message = error.response?.data?.detail || error.response?.data?.message || error.message;

    console.error(`❌ Geospatial proxy failed for ${method.toUpperCase()} ${targetUrl}:`, message);
    res.status(status).json({
      success: false,
      message: message || 'Geospatial service is currently unavailable.',
      upstream: AI_SERVICE_URL,
      path,
    });
  }
};

router.get('/stats', (req, res) => proxyRequest(req, res, 'get', '/api/v1/stats'));
router.get('/reports', (req, res) => proxyRequest(req, res, 'get', '/api/v1/reports'));
router.get('/reports/:reportId', (req, res) => proxyRequest(req, res, 'get', `/api/v1/reports/${req.params.reportId}`));
router.get('/hotspots', (req, res) => proxyRequest(req, res, 'get', '/api/v1/hotspots'));
router.get('/hotspots/nearby', (req, res) => proxyRequest(req, res, 'get', '/api/v1/hotspots/nearby'));
router.get('/region/info', (req, res) => proxyRequest(req, res, 'get', '/api/v1/region/info'));
router.get('/data-sources', (req, res) => proxyRequest(req, res, 'get', '/api/v1/data-sources'));
router.post('/analyze-location', (req, res) => proxyRequest(req, res, 'post', '/api/v1/analyze-location'));
router.post('/time-machine', (req, res) => proxyRequest(req, res, 'post', '/api/v1/time-machine'));
router.post('/reports/submit', (req, res) => proxyRequest(req, res, 'post', '/api/v1/reports/submit'));

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Geospatial routes are available.',
    upstream: AI_SERVICE_URL,
  });
});

module.exports = router;

const express = require('express');
const axios = require('axios');

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const AI_SERVICE_TIMEOUT = 30000;

const proxyRequest = async (req, res, method, path) => {
  try {
    const response = await axios({
      method,
      url: `${AI_SERVICE_URL}${path}`,
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
    res.status(status).json({
      success: false,
      message: error.response?.data?.detail || error.response?.data?.message || error.message,
      upstream: AI_SERVICE_URL,
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

module.exports = router;

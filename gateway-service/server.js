const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/users', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true
}));

app.use('/api/workouts', createProxyMiddleware({
  target: process.env.WORKOUT_SERVICE_URL,
  changeOrigin: true
}));

app.use('/api/moveGoals', createProxyMiddleware({
  target: process.env.MOVEGOALS_SERVICE_URL,
  changeOrigin: true
}));

app.use('/api/reports', createProxyMiddleware({
  target: process.env.ANALYTICAL_SERVICE_URL,
  changeOrigin: true
}));

app.use(express.static(path.join(__dirname, 'client-build')));

app.use('/', (req, res) => {
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'client-build', 'index.html'));
  } else {
    res.status(404).json({ message: 'API route not found' });
  }
});

app.use((err, req, res, next) => {
  console.error('Gateway Error:', err.message);
  res.status(500).json({ message: 'Internal Gateway Error' });
});

app.listen(5000, () => {
  console.log('API Gateway is running on http://localhost:5000');
});

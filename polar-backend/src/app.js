require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiResponse = require('./utils/apiResponse');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./modules/health/health.routes');

const app = express();

// Middleware (in order)
app.use(cors({ origin: '*' }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/expeditions', require('./modules/expedition/expedition.routes'));

// 404 Handler
app.use((req, res) => {
  return apiResponse.error(res, 'Route not found', 404);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;

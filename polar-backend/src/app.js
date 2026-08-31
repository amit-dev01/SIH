require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const apiResponse = require('./utils/apiResponse');
const errorHandler = require('./middleware/errorHandler');

const healthRoutes = require('./modules/health/health.routes');
const expeditionRoutes = require('./modules/expedition/expedition.routes');
const mediaRoutes = require('./modules/media/media.routes');
const publicationRoutes = require('./modules/publication/publication.routes');
const datasetRoutes = require('./modules/dataset/dataset.routes');
const searchRoutes = require('./modules/search/search.routes');
const mapRoutes = require('./modules/map/map.routes');
const outreachRoutes = require('./modules/outreach/outreach.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const app = express();

// Middleware (in order)
app.use(cors({ origin: '*' }));
app.use(
  helmet({
    contentSecurityPolicy: false // Allows Swagger UI to load scripts/styles cleanly
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 1. Swagger OpenAPI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 2-10. Application API Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/expeditions', expeditionRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/publications', publicationRoutes);
app.use('/api/v1/datasets', datasetRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/map', mapRoutes);
app.use('/api/v1/outreach', outreachRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// 11. 404 Handler
app.use((req, res) => {
  return apiResponse.error(res, 'Route not found', 404);
});

// 12. Global Error Handler
app.use(errorHandler);

module.exports = app;

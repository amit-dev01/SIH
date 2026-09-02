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
const vaaniRoutes = require('./modules/vaani/vaani.routes');
const askRoutes = require('./modules/ask/ask.routes');
const stationsRoutes = require('./modules/stations/stations.routes');
const assistantRoutes = require('./modules/assistant/assistant.routes');
const authRoutes = require('./modules/auth/auth.routes');
const workspaceRoutes = require('./modules/workspace/workspace.routes');
const knowledgeRoutes = require('./modules/knowledge/knowledge.routes');

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

// 2. Primary /api/v1 Routes (Versioned API)
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/expeditions', expeditionRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/publications', publicationRoutes);
app.use('/api/v1/datasets', datasetRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/map', mapRoutes);
app.use('/api/v1/outreach', outreachRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/vaani', vaaniRoutes);
app.use('/api/v1/ask', askRoutes);
app.use('/api/v1/stations', stationsRoutes);
app.use('/api/v1/assistant', assistantRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspace', workspaceRoutes);
app.use('/api/v1/knowledge', knowledgeRoutes);

// 3. Direct /api/ Aliases (Frontend Flexibility: works whether frontend uses /api/ or /api/v1/)
app.use('/api/assistant', assistantRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/expeditions', expeditionRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workspace', workspaceRoutes);

// 4. 404 Handler
app.use((req, res) => {
  return apiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// 5. Global Error Handler
app.use(errorHandler);

module.exports = app;

const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

const server = app.listen(config.port, () => {
  logger.info('🧊 Polar Science Outreach Portal API (SIH26063 - NCPOR / MoES)');
  logger.info(`📡 Server running on port: ${config.port} (${config.nodeEnv})`);
  logger.info(`✅ Health: http://localhost:${config.port}/api/v1/health`);
  logger.info(`📑 Swagger Docs: http://localhost:${config.port}/api-docs`);
  if (config.nodeEnv === 'production') {
    logger.info('🌐 Live URL: https://polar-outreach.onrender.com/api/v1/health');
  }
});

// Graceful shutdown handlers
const shutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed cleanly.');
    process.exit(0);
  });

  // Force exit after 10 seconds if hanging
  setTimeout(() => {
    logger.error('Forcing process shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;

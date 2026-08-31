const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

app.listen(config.port, () => {
  logger.info('🧊 Polar Science Outreach Portal API (SIH26063 - NCPOR / MoES)');
  logger.info(`📡 Server running on port: ${config.port} (${config.nodeEnv})`);
  logger.info(`✅ Health: http://localhost:${config.port}/api/v1/health`);
  logger.info(`📑 Swagger Docs: http://localhost:${config.port}/api-docs`);
  if (config.nodeEnv === 'production') {
    logger.info('🌐 Live URL: https://polar-outreach.onrender.com/api/v1/health');
  }
});

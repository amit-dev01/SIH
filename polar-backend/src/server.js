const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

app.listen(config.port, () => {
  logger.info('🧊 Polar Science Outreach Portal');
  logger.info(`📡 http://localhost:${config.port}`);
  logger.info(`✅ Health: http://localhost:${config.port}/api/v1/health`);
});

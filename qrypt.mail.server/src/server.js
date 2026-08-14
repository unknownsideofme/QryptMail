import app from './app.js';
import { env } from './config/env.js';
import { db } from './config/database.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  logger.info('Starting server...');
  
  // Establish database connection
  try {
    await db.connect();
    logger.info('Database connection established successfully.');
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}. Exiting...`);
    process.exit(1);
  }
  
  const server = app.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    try {
      await db.disconnect();
      logger.info('Database connection closed.');
    } catch (err) {
      logger.error('Error during database disconnection', err);
    }
    
    server.close(() => {
      logger.info('Express server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch(err => {
  logger.error('Startup crash', err);
  process.exit(1);
});

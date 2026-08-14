import { DBFactory } from '../factory/dbFactory/db.factory.js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Export the singleton database instance dynamically based on environment configuration
export const db = DBFactory.getdb(env.DB_TYPE);

export const checkDatabaseHealth = async () => {
  try {
    if (env.DB_TYPE === 'mongo') {
      // Verify connection by running a findOne on the users collection
      await db.query('users.findOne', [{}]);
    } else {
      // In PostgreSQL, run SELECT NOW()
      await db.query('SELECT NOW()');
    }
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    logger.error('Database connection health check failed', err);
    return {
      status: 'unhealthy',
      error: err.message
    };
  }
};

import express from 'express';
import cors from 'cors';
import { checkDatabaseHealth } from './config/database.js';
import { errorHandler } from './middleware/error.middleware.js';
import { logger } from './utils/logger.js';
import authRouter from './routes/auth.routes.js';
import mailRouter from './routes/mail.routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Auth Routes
app.use('/api/auth', authRouter);

// Mail Routes
app.use('/api/mail', mailRouter);

app.get('/health', async (req, res, next) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const isHealthy = dbHealth.status === 'healthy';
    
    res.status(isHealthy ? 200 : 500).json({
      success: isHealthy,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        database: dbHealth
      }
    });
  } catch (err) {
    next(err);
  }
});

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

app.use(errorHandler);

export default app;

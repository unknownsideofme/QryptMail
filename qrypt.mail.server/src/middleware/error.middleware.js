import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  logger.error(`${errorCode} - ${message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined
  });

  const responseBody = {
    success: false,
    error: {
      code: errorCode,
      message: message
    }
  };

  if (env.NODE_ENV === 'development') {
    responseBody.error.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

import { env } from '../config/env.js';

// Structured logging helper that filters sensitive attributes
const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  
  let cleanMeta = null;
  if (meta) {
    try {
      const serialized = JSON.stringify(meta);
      const parsedMeta = JSON.parse(serialized);
      
      const sanitize = (obj) => {
        const sensitiveKeys = [
          'token', 'access_token', 'refresh_token', 'password', 'secret',
          'key', 'key_material', 'aes', 'otp', 'plaintext', 'body', 'content',
          'authorization', 'auth'
        ];
        
        for (const k in obj) {
          if (typeof obj[k] === 'object' && obj[k] !== null) {
            sanitize(obj[k]);
          } else if (typeof k === 'string') {
            const lowKey = k.toLowerCase();
            if (sensitiveKeys.some(sk => lowKey.includes(sk))) {
              obj[k] = '[REDACTED_SENSITIVE_DATA]';
            }
          }
        }
      };
      
      sanitize(parsedMeta);
      cleanMeta = parsedMeta;
    } catch (e) {
      cleanMeta = '[Serialization Error]';
    }
  }

  const logObj = {
    timestamp,
    level,
    message,
    ...(cleanMeta && { metadata: cleanMeta })
  };

  return env.NODE_ENV === 'development' 
    ? `[${timestamp}] [${level.toUpperCase()}]: ${message} ${cleanMeta ? JSON.stringify(cleanMeta, null, 2) : ''}`
    : JSON.stringify(logObj);
};

export const logger = {
  info: (message, meta) => {
    console.log(formatMessage('info', message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatMessage('warn', message, meta));
  },
  error: (message, meta) => {
    console.error(formatMessage('error', message, meta));
  },
  debug: (message, meta) => {
    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      console.log(formatMessage('debug', message, meta));
    }
  }
};

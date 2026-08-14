export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorFactories = {
  authRequired: (msg = 'Authentication is required') => 
    new AppError(msg, 401, 'AUTH_REQUIRED'),
    
  invalidRequest: (msg = 'Invalid input parameters') => 
    new AppError(msg, 400, 'INVALID_REQUEST'),
    
  accountNotFound: (msg = 'Mail account not found') => 
    new AppError(msg, 440, 'ACCOUNT_NOT_FOUND'),
    
  providerError: (msg = 'Mail provider operation failed') => 
    new AppError(msg, 502, 'PROVIDER_ERROR'),
    
  qkdUnavailable: (msg = 'QKD service is offline') => 
    new AppError(msg, 503, 'QKD_UNAVAILABLE'),
    
  keyNotAvailable: (msg = 'No QKD key material available') => 
    new AppError(msg, 409, 'KEY_NOT_AVAILABLE'),
    
  keyAlreadyConsumed: (msg = 'The QKD key has already been consumed') => 
    new AppError(msg, 410, 'KEY_ALREADY_CONSUMED'),
    
  encryptionFailed: (msg = 'Encryption process failed') => 
    new AppError(msg, 500, 'ENCRYPTION_FAILED'),
    
  decryptionFailed: (msg = 'Decryption process failed') => 
    new AppError(msg, 400, 'DECRYPTION_FAILED'),
    
  invalidQryptmail: (msg = 'Message is not a valid QryptMail message') => 
    new AppError(msg, 400, 'INVALID_QRYPTMAIL'),
    
  messageNotFound: (msg = 'Message not found') => 
    new AppError(msg, 404, 'MESSAGE_NOT_FOUND')
};

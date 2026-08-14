import { errorFactories } from '../utils/errors.js';

export const validateRequest = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!parsed.success) {
      const errorMessages = parsed.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      throw errorFactories.invalidRequest(errorMessages);
    }

    if (parsed.data.body !== undefined) {
      req.body = parsed.data.body;
    }
    if (parsed.data.query !== undefined) {
      Object.defineProperty(req, 'query', { value: parsed.data.query, writable: true, configurable: true });
    }
    if (parsed.data.params !== undefined) {
      Object.defineProperty(req, 'params', { value: parsed.data.params, writable: true, configurable: true });
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

import { jest } from '@jest/globals';
import { z } from 'zod';
import { validateRequest } from '../../src/middleware/validation.middleware.js';

describe('Validation Middleware Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      // Simulate Express IncomingMessage with read-only query and params properties
      get query() {
        return this._query || {};
      },
      get params() {
        return this._params || {};
      }
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  it('should call next() if schema validation succeeds', () => {
    const schema = z.object({
      body: z.object({
        name: z.string()
      })
    });

    mockReq.body = { name: 'John Doe' };

    const middleware = validateRequest(schema);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockReq.body).toEqual({ name: 'John Doe' });
  });

  it('should call next(error) if schema validation fails', () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email()
      })
    });

    mockReq.body = { email: 'not-an-email' };

    const middleware = validateRequest(schema);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const errorArg = mockNext.mock.calls[0][0];
    expect(errorArg).toBeDefined();
    expect(errorArg.statusCode).toBe(400);
    expect(errorArg.message).toContain('email');
  });

  it('should safely bypass read-only query and params properties using Object.defineProperty', () => {
    const schema = z.object({
      query: z.object({
        search: z.string()
      }),
      params: z.object({
        id: z.string()
      })
    });

    // Provide query and params values
    mockReq._query = { search: 'term' };
    mockReq._params = { id: '456' };

    const middleware = validateRequest(schema);
    
    // This should NOT throw "TypeError: Cannot set property query ... which has only a getter"
    expect(() => middleware(mockReq, mockRes, mockNext)).not.toThrow();
    
    expect(mockNext).toHaveBeenCalledWith();
    expect(mockReq.query).toEqual({ search: 'term' });
    expect(mockReq.params).toEqual({ id: '456' });
  });
});

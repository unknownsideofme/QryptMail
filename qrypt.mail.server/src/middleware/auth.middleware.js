import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
import { errorFactories } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Protect middleware: intercepts requests to verify user session token
 */
export const protect = async (req, res, next) => {
    try {
        let token;
        
        // 1. Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw errorFactories.authRequired('Not authorized to access this resource. Token is missing.');
        }

        // 2. Verify token signature and expiry
        let decoded;
        try {
            decoded = jwt.verify(token, env.JWT_SECRET);
        } catch (err) {
            throw errorFactories.authRequired('Not authorized. Token is invalid or expired.');
        }

        // 3. Find user profile associated with token
        const user = await db.findUserById(decoded.userId);
        if (!user) {
            throw errorFactories.authRequired('The user belonging to this token no longer exists.');
        }

        // 4. Mount user identity info onto the request object
        req.user = {
            id: user._id || user.id,
            name: user.name,
            email: user.email
        };

        next();
    } catch (err) {
        next(err);
    }
};

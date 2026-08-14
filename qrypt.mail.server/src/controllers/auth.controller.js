import jwt from 'jsonwebtoken';
import authFactory from '../factory/authFactory/auth.factory.js';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const factory = new authFactory();

/**
 * Redirect user to Google OAuth Consent Page
 */
export const googleSignIn = async (req, res, next) => {
    try {
        const { origin } = req.query;
        const authProvider = factory.getAuth('google');
        const url = await authProvider.signIn(origin);
        logger.info(`Redirecting to Google OAuth URL: ${url}`);
        res.redirect(url);
    } catch (err) {
        next(err);
    }
};

/**
 * Handle Google redirect callback, exchange code, create/find user, and save mail account
 */
export const googleCallback = async (req, res, next) => {
    try {
        const { code, state } = req.query;
        if (!code) {
            return res.status(400).json({ success: false, error: 'Authorization code missing' });
        }
        
        const authProvider = factory.getAuth('google');
        const tokens = await authProvider.getTokens(code);
        
        // 1. Fetch user info from Google APIs
        const profile = await authProvider.getUserProfile(tokens.access_token);
        
        // 2. Find or create User in the database via the db class
        let user = await db.findUserByProviderId('google', profile.id);
        if (!user) {
            user = await db.createUser({
                name: profile.name,
                email: profile.email,
                authProvider: 'google',
                providerUserId: profile.id
            });
            logger.info(`Created new user registration for Google profile: ${profile.email}`);
        } else {
            logger.info(`Found existing user registration for Google profile: ${profile.email}`);
        }

        const userId = user._id || user.id;
        
        // 3. Find or create Mail Account details via the db class
        let mailAccount = await db.findMailAccountByUserAndEmail(userId, profile.email);
        if (!mailAccount) {
            mailAccount = await db.createMailAccount({
                userId,
                provider: 'google',
                email: profile.email,
                providerAccountId: profile.id,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenExpiresAt: tokens.token_expires_at
            });
            logger.info(`Linked Google mail account credentials for: ${profile.email}`);
        } else {
            // Update the connection tokens
            await db.updateMailAccountTokens(mailAccount._id || mailAccount.id, {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenExpiresAt: tokens.token_expires_at
            });
            logger.info(`Updated Google mail credentials for: ${profile.email}`);
        }

        // 4. Issue a signed application session JWT
        const appToken = jwt.sign(
            { userId: userId.toString(), email: profile.email },
            env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        const frontendUrl = state || process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/?success=true&appToken=${appToken}&email=${encodeURIComponent(profile.email)}&name=${encodeURIComponent(profile.name)}&userId=${userId.toString()}`);
    } catch (err) {
        logger.error(`Google OAuth callback failed: ${err.message}`);
        const { state } = req.query;
        const frontendUrl = state || process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/?failure=true&error=${encodeURIComponent(err.message)}`);
    }
};

/**
 * Redirect user to Microsoft OAuth consent page
 */
export const microsoftSignIn = async (req, res, next) => {
    try {
        const { origin } = req.query;
        const authProvider = factory.getAuth('microsoft');
        const url = await authProvider.signIn(origin);
        logger.info(`Redirecting to Microsoft OAuth URL: ${url}`);
        res.redirect(url);
    } catch (err) {
        next(err);
    }
};

/**
 * Handle Microsoft redirect callback, exchange code, create/find user, and save mail account
 */
export const microsoftCallback = async (req, res, next) => {
    try {
        const { code, state } = req.query;
        if (!code) {
            return res.status(400).json({ success: false, error: 'Authorization code missing' });
        }

        const authProvider = factory.getAuth('microsoft');
        const tokens = await authProvider.getTokens(code);

        // 1. Fetch user profile from Microsoft Graph
        const profile = await authProvider.getUserProfile(tokens.access_token);

        // 2. Find or create User in the database via the db class
        let user = await db.findUserByProviderId('microsoft', profile.id);
        if (!user) {
            user = await db.createUser({
                name: profile.name,
                email: profile.email,
                authProvider: 'microsoft',
                providerUserId: profile.id
            });
            logger.info(`Created new user registration for Microsoft profile: ${profile.email}`);
        } else {
            logger.info(`Found existing user registration for Microsoft profile: ${profile.email}`);
        }

        const userId = user._id || user.id;

        // 3. Find or create Mail Account details via the db class
        let mailAccount = await db.findMailAccountByUserAndEmail(userId, profile.email);
        if (!mailAccount) {
            mailAccount = await db.createMailAccount({
                userId,
                provider: 'microsoft',
                email: profile.email,
                providerAccountId: profile.id,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenExpiresAt: tokens.token_expires_at
            });
            logger.info(`Linked Microsoft mail account credentials for: ${profile.email}`);
        } else {
            // Update the connection tokens
            await db.updateMailAccountTokens(mailAccount._id || mailAccount.id, {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenExpiresAt: tokens.token_expires_at
            });
            logger.info(`Updated Microsoft mail credentials for: ${profile.email}`);
        }

        // 4. Issue a signed application session JWT
        const appToken = jwt.sign(
            { userId: userId.toString(), email: profile.email },
            env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const frontendUrl = state || process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/?success=true&appToken=${appToken}&email=${encodeURIComponent(profile.email)}&name=${encodeURIComponent(profile.name)}&userId=${userId.toString()}`);
    } catch (err) {
        logger.error(`Microsoft OAuth callback failed: ${err.message}`);
        const { state } = req.query;
        const frontendUrl = state || process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/?failure=true&error=${encodeURIComponent(err.message)}`);
    }
};

/**
 * Retrieve profile information for the authenticated user
 */
export const getMe = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Handle logout request
 */
export const logout = async (req, res, next) => {
    try {
        logger.info(`User logged out: ${req.user.email}`);
        res.json({
            success: true,
            message: "Successfully logged out!"
        });
    } catch (err) {
        next(err);
    }
};

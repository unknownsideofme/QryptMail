import { google } from 'googleapis';
import AuthProvider from '../../../interface/authInterface/auth.interface.js';

export default class GoogleAuth extends AuthProvider {
    constructor() {
        super();
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    /**
     * Generate the authorization URL for user consent
     */
    async signIn(state) {
        const scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.compose',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: scopes,
            state: state
        });
    }

    async signOut() {
        // Local sign out or token revocation could be implemented here
        return true;
    }

    /**
     * Exchange authorization code for tokens
     * @param {string} code 
     */
    async getTokens(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
            raw: tokens
        };
    }

    /**
     * Refresh access token using a refresh token
     * @param {string} refreshToken 
     */
    async refreshToken(refreshToken) {
        this.oauth2Client.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        return {
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token || refreshToken,
            token_expires_at: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null,
            raw: credentials
        };
    }

    /**
     * Fetch user profile (Google User ID, email, name)
     * @param {string} accessToken 
     */
    async getUserProfile(accessToken) {
        this.oauth2Client.setCredentials({ access_token: accessToken });
        const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
        const res = await oauth2.userinfo.get();
        return {
            id: res.data.id,
            email: res.data.email,
            name: res.data.name
        };
    }

    /**
     * Demo method to fetch message list using gmail API client
     */
    async fetchMail(accessToken) {
        this.oauth2Client.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        const res = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
        return res.data;
    }
}

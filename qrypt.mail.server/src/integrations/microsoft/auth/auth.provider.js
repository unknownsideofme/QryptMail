import { ConfidentialClientApplication } from '@azure/msal-node';
import AuthProvider from '../../../interface/authInterface/auth.interface.js';

export default class MicrosoftAuth extends AuthProvider {
    constructor() {
        super();
        this.msalConfig = {
            auth: {
                clientId: process.env.MICROSOFT_CLIENT_ID,
                authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || 'common'}`,
                clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            }
        };
        this.cca = new ConfidentialClientApplication(this.msalConfig);
    }

    /**
     * Generate the authorization URL using MSAL ConfidentialClientApplication
     */
    async signIn(state) {
        const authCodeUrlParameters = {
            scopes: [
                'https://graph.microsoft.com/Mail.Read',
                'https://graph.microsoft.com/Mail.Send',
                'https://graph.microsoft.com/User.Read',
                'offline_access'
            ],
            redirectUri: process.env.MICROSOFT_REDIRECT_URI,
            state: state
        };
        return this.cca.getAuthCodeUrl(authCodeUrlParameters);
    }

    async signOut() {
        return true;
    }

    /**
     * Exchange auth code for tokens via HTTP POST to MS Identity Platform
     * This provides direct access to the refresh_token string for storage.
     */
    async getTokens(code) {
        const params = new URLSearchParams({
            client_id: process.env.MICROSOFT_CLIENT_ID,
            client_secret: process.env.MICROSOFT_CLIENT_SECRET,
            code: code,
            redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
            grant_type: 'authorization_code',
            scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access'
        });

        const response = await fetch(`https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || 'common'}/oauth2/v2.0/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error_description || data.error || 'Failed to exchange Microsoft authorization code');
        }

        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            token_expires_at: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null,
            raw: data
        };
    }

    /**
     * Refresh access token using a refresh token
     */
    async refreshToken(refreshToken) {
        const params = new URLSearchParams({
            client_id: process.env.MICROSOFT_CLIENT_ID,
            client_secret: process.env.MICROSOFT_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access'
        });

        const response = await fetch(`https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || 'common'}/oauth2/v2.0/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error_description || data.error || 'Failed to refresh Microsoft token');
        }

        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token || refreshToken,
            token_expires_at: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null,
            raw: data
        };
    }

    /**
     * Fetch user profile (Microsoft User ID, email, name)
     * @param {string} accessToken 
     */
    async getUserProfile(accessToken) {
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to fetch Microsoft user profile');
        }
        return {
            id: data.id,
            email: data.mail || data.userPrincipalName,
            name: data.displayName
        };
    }

    /**
     * Fetch standard inbox list via Microsoft Graph
     */
    async fetchMail(accessToken) {
        const response = await fetch('https://graph.microsoft.com/v1.0/me/messages', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to fetch Microsoft messages');
        }
        return data;
    }
}

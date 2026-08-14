import pg from 'pg';
import Database from '../../interface/dbInterface/db.interface.js';

const { Pool } = pg;

export default class PsqlDatabase extends Database {
    #connectionString;
    #pool;

    constructor(connectionString = process.env.DATABASE_URL) {
        super();
        this.#connectionString = connectionString;
    }

    /**
     * Establish database pool connection and verify it
     */
    async connect() {
        if (this.#pool) return; // Already connected

        this.#pool = new Pool({
            connectionString: this.#connectionString,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        // Verify the connection works
        try {
            const client = await this.#pool.connect();
            client.release();
        } catch (err) {
            throw new Error(`Failed to connect to PostgreSQL: ${err.message}`);
        }
    }

    /**
     * Close all idle database connections
     */
    async disconnect() {
        if (this.#pool) {
            await this.#pool.end();
            this.#pool = null;
        }
    }

    /**
     * Execute SQL queries
     * @param {string} statement - SQL query string
     * @param {Array} params - Parameters to insert into SQL query
     */
    async query(statement, params) {
        if (!this.#pool) {
            throw new Error("Database not connected. Call connect() first.");
        }
        return this.#pool.query(statement, params);
    }

    /**
     * Find user by database unique ID
     */
    async findUserById(userId) {
        const sql = `SELECT * FROM users WHERE id = $1;`;
        const res = await this.query(sql, [userId]);
        return res.rows[0] || null;
    }

    /**
     * Find user by provider credentials via joined mail accounts check
     */
    async findUserByProviderId(provider, providerAccountId) {
        const sql = `
            SELECT u.* FROM users u
            JOIN mail_accounts ma ON u.id = ma.user_id
            WHERE ma.provider = $1 AND ma.provider_account_id = $2;
        `;
        const res = await this.query(sql, [provider, providerAccountId]);
        return res.rows[0] || null;
    }

    /**
     * Create a user profile
     */
    async createUser({ name }) {
        const sql = `
            INSERT INTO users (name)
            VALUES ($1)
            RETURNING *;
        `;
        const res = await this.query(sql, [name]);
        return res.rows[0];
    }

    /**
     * Find linked mail account by user and email address
     */
    async findMailAccountByUserAndEmail(userId, email) {
        const sql = `
            SELECT * FROM mail_accounts
            WHERE user_id = $1 AND email = $2;
        `;
        const res = await this.query(sql, [userId, email]);
        return res.rows[0] || null;
    }

    /**
     * Link mail account credentials
     */
    async createMailAccount({ userId, provider, email, providerAccountId, accessToken, refreshToken, tokenExpiresAt }) {
        const sql = `
            INSERT INTO mail_accounts (
                user_id, provider, email, provider_account_id,
                access_token, refresh_token, token_expires_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const res = await this.query(sql, [
            userId, provider, email, providerAccountId,
            accessToken, refreshToken, tokenExpiresAt ? new Date(tokenExpiresAt) : null
        ]);
        return res.rows[0];
    }

    /**
     * Update access and refresh tokens
     */
    async updateMailAccountTokens(accountId, { accessToken, refreshToken, tokenExpiresAt }) {
        const sql = `
            UPDATE mail_accounts
            SET access_token = $1,
                refresh_token = COALESCE($2, refresh_token),
                token_expires_at = COALESCE($3, token_expires_at),
                updated_at = NOW()
            WHERE id = $4
            RETURNING *;
        `;
        const res = await this.query(sql, [
            accessToken, refreshToken, tokenExpiresAt ? new Date(tokenExpiresAt) : null, accountId
        ]);
        return res.rows[0];
    }
}
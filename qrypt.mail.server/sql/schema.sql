CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS mail_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    provider TEXT NOT NULL
        CHECK (provider IN ('google', 'microsoft')),

    email TEXT NOT NULL,

    provider_account_id TEXT,

    access_token TEXT,

    refresh_token TEXT,

    token_expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, email)
);


CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    provider TEXT NOT NULL,

    provider_message_id TEXT NOT NULL,

    sender_email TEXT,

    subject TEXT,

    security_level TEXT NOT NULL DEFAULT 'NONE'
        CHECK (
            security_level IN (
                'NONE',
                'QKD_AES',
                'QKD_OTP'
            )
        ),

    qkd_key_id TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS qkd_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    key_id TEXT NOT NULL UNIQUE,

    owner_user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    key_length INTEGER NOT NULL,

    status TEXT NOT NULL DEFAULT 'AVAILABLE'
        CHECK (
            status IN (
                'AVAILABLE',
                'RESERVED',
                'CONSUMED'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    reserved_at TIMESTAMPTZ,

    consumed_at TIMESTAMPTZ
);


CREATE INDEX IF NOT EXISTS idx_mail_accounts_user
ON mail_accounts(user_id);

CREATE INDEX IF NOT EXISTS idx_messages_user
ON messages(user_id);

CREATE INDEX IF NOT EXISTS idx_qkd_keys_status
ON qkd_keys(status);    
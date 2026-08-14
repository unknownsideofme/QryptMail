import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DB_TYPE: z.enum(['postgres', 'mongo']).default('postgres'),
  DATABASE_URL: z.string().url().optional(),
  DB_USER: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PASSWORD: z.string().optional(),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().optional(),
  MONGODB_URI: z.string().url().optional(),
  JWT_SECRET: z.string().default('fallback-jwt-secret-qryptmail'),
  ENCRYPTION_KEY: z.string().length(64, 'Encryption key must be a 64-character hex string (32 bytes)').default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
}).refine(data => {
  if (data.DB_TYPE === 'postgres' && !data.DATABASE_URL && (!data.DB_USER || !data.DB_NAME)) {
    return false;
  }
  if (data.DB_TYPE === 'mongo' && !data.MONGODB_URI) {
    return false;
  }
  return true;
}, {
  message: "Provide DATABASE_URL/credentials for postgres, or MONGODB_URI for mongo."
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;

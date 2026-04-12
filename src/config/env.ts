import dotenv from 'dotenv';
dotenv.config();
import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter ao menos 32 caracteres'),
    JWT_ISSUER: z.string().trim().min(1).default('api-contact'),
    JWT_AUDIENCE: z.string().trim().min(1).default('api-contact-clients'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CORS_ORIGIN: z.string().default('*'),
    TRUST_PROXY: z.string().default('false'),
    LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
    JWT_REFRESH_EXPIRY_DAYS: z.coerce.number().int().positive().default(7),
});

export const env = envSchema.parse(process.env);

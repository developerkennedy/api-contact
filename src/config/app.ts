import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { errorHandler } from '../http/middlewares/error-handler';
import { contactRoutes } from '../http/routes/contact.routes';
import { authRoutes } from '../http/routes/auth.routes';
import { categoryRoutes } from '../http/routes/category.routes';
import { healthRoutes } from '../http/routes/health.routes';
import { requestId } from '../http/middlewares/request-id.middleware';
import { requestLogger } from '../http/middlewares/request-logger.middleware';
import { env } from './env';
import rateLimit from 'express-rate-limit';

export const app = express();

function parseTrustProxy(value: string): boolean | number | string {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === 'true') return true;
    if (normalizedValue === 'false') return false;

    const numericValue = Number(value);
    if (Number.isInteger(numericValue) && numericValue >= 0) {
        return numericValue;
    }

    return value;
}

function resolveCorsOrigin(originValue: string): true | string[] {
    const origins = originValue
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (origins.length === 0 || origins.includes('*')) {
        if (env.NODE_ENV === 'production') {
            throw new Error(
                'CORS_ORIGIN must be explicitly set to allowed origins in production (wildcard is not allowed)'
            );
        }

        return true;
    }

    return origins;
}

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
});

export const authenticatedLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.id ?? req.ip ?? 'unknown',
});

app.set('trust proxy', parseTrustProxy(env.TRUST_PROXY));
app.use(requestId);
app.use(helmet());
app.use(
    cors({
        origin: resolveCorsOrigin(env.CORS_ORIGIN),
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);
app.use(compression());
app.use(globalLimiter);
app.use(requestLogger);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use('/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/categories', categoryRoutes);

app.use(errorHandler);

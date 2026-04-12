import { Router } from 'express';
import { db } from '../../config/db';
import { sql } from 'drizzle-orm';
import { logger } from '../../shared/logger/logger';

const router = Router();

router.get('/', async (_req, res) => {
    try {
        await db.execute(sql`SELECT 1`);
        res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
        logger.error({ err }, 'Health check DB ping failed');
        res.status(503).json({ status: 'error', db: 'disconnected' });
    }
});

export { router as healthRoutes };

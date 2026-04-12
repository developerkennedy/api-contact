import { Request, Response, NextFunction } from 'express';
import { logger } from '../../shared/logger/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
        logger.info({
            requestId: req.id,
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            durationMs: Date.now() - start,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
    });
    next();
}

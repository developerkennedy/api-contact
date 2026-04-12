import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { logger } from '../shared/logger/logger';

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.slice(7);

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        req.user = verifyToken(token);
        return next();
    } catch (err) {
        logger.warn({ err, requestId: req.id }, 'Token verification failed');
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

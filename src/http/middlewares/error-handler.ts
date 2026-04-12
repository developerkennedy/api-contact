import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { ZodError } from 'zod';
import { logger } from '../../shared/logger/logger';

type PostgresLikeError = Error & {
    code?: string;
    constraint_name?: string;
    detail?: string;
    table_name?: string;
};

function isPostgresError(err: unknown): err is PostgresLikeError {
    return (
        err instanceof Error &&
        err.name === 'PostgresError' &&
        'code' in err &&
        typeof err.code === 'string'
    );
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
    if (err instanceof AppError) {
        logger.warn(
            { err, requestId: req.id, method: req.method, url: req.originalUrl },
            'Application error'
        );
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    if (err instanceof ZodError) {
        const flattened = err.flatten();
        logger.warn(
            {
                requestId: req.id,
                method: req.method,
                url: req.originalUrl,
                errors: flattened,
            },
            'Validation error'
        );
        res.status(422).json({
            message: 'Validation error',
            errors: flattened.fieldErrors,
        });
        return;
    }

    if (isPostgresError(err)) {
        logger.warn(
            {
                err,
                requestId: req.id,
                method: req.method,
                url: req.originalUrl,
            },
            'Database constraint error'
        );

        if (err.code === '23505') {
            res.status(409).json({
                message: 'Resource already exists',
            });
            return;
        }

        if (err.code === '23503') {
            res.status(409).json({
                message: 'Resource is still referenced by another record',
            });
            return;
        }

        if (err.code === '22P02') {
            res.status(400).json({ message: 'Invalid value format' });
            return;
        }
    }

    logger.error(
        { err, requestId: req.id, method: req.method, url: req.originalUrl },
        'Unhandled error'
    );
    res.status(500).json({ message: 'Internal server error' });
}

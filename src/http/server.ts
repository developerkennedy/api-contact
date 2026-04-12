import { app } from '../config/app';
import { queryClient } from '../config/db';
import { env } from '../config/env';
import { logger } from '../shared/logger/logger';

const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started');
});

let isShuttingDown = false;

function shutdown(signal: string) {
    if (isShuttingDown) {
        logger.warn({ signal }, 'Shutdown already in progress');
        return;
    }

    isShuttingDown = true;
    logger.info({ signal }, 'Shutdown signal received');
    const forceExitTimer = setTimeout(() => process.exit(1), 10_000).unref();

    server.close(async (error) => {
        if (error) {
            logger.error({ err: error }, 'Error while closing HTTP server');
            clearTimeout(forceExitTimer);
            process.exit(1);
        }

        logger.info('HTTP server closed');

        try {
            await queryClient.end({ timeout: 5 });
            logger.info('Database connections closed');
            clearTimeout(forceExitTimer);
            process.exit(0);
        } catch (dbError) {
            logger.error({ err: dbError }, 'Error while closing database connections');
            clearTimeout(forceExitTimer);
            process.exit(1);
        }
    });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

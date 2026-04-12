import { Router } from 'express';
import { makeAuthControllers } from '../../factories/auth.factory';
import { authLimiter } from '../../config/app';
import { authenticate } from '../../auth/middleware';

const router = Router();
const controllers = makeAuthControllers();

router.post('/register', authLimiter, (req, res) => controllers.register.handle(req, res));
router.post('/login', authLimiter, (req, res) => controllers.login.handle(req, res));
router.post('/refresh', authLimiter, (req, res) => controllers.refresh.handle(req, res));
router.post('/logout', authenticate, (req, res) => controllers.logout.handle(req, res));

export { router as authRoutes };

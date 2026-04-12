import { Router } from 'express';
import { makeAuthControllers } from '../../factories/auth.factory';
import { authLimiter } from '../../config/app';

const router = Router();
const controllers = makeAuthControllers();

router.post('/register', authLimiter, (req, res) => controllers.register.handle(req, res));
router.post('/login', authLimiter, (req, res) => controllers.login.handle(req, res));

export { router as authRoutes };

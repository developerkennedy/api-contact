import { Router } from 'express';
import { authenticate } from '../../auth/middleware';
import { makeContactControllers } from '../../factories/contact.factory';
import { authenticatedLimiter } from '../../config/app';

const router = Router();
const controllers = makeContactControllers();

router.use(authenticate);
router.use(authenticatedLimiter);

router.post('/', (req, res) => controllers.create.handle(req, res));
router.get('/', (req, res) => controllers.list.handle(req, res));
router.get('/:id', (req, res) => controllers.getById.handle(req, res));
router.patch('/:id', (req, res) => controllers.update.handle(req, res));
router.delete('/:id', (req, res) => controllers.delete.handle(req, res));

export { router as contactRoutes };

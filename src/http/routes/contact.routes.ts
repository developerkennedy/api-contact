import {Request, Response} from "express";
import { Router } from 'express';
import { authenticate } from '../../auth/middleware';
import { makeContactControllers } from '../../factories/contact.factory';

const router = Router();
const controllers = makeContactControllers();

router.get('/',(req: Request, res: Response) => {
    res.send({ok:true})
})

router.use(authenticate);

router.post('/api/v1/contact/create', (req, res) => controllers.create.handle(req, res));
router.get('/api/v1/contact/list', (req, res) => controllers.list.handle(req, res));
router.get('/api/v1/contact/:id', (req, res) => controllers.getById.handle(req, res));
router.patch('/api/v1/contact/:id', (req, res) => controllers.update.handle(req, res));
router.delete('/api/v1/contact/:id', (req, res) => controllers.delete.handle(req, res));

export { router as contactRoutes };

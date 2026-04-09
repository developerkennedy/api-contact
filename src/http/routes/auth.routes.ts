import { Router } from "express";
import { makeAuthControllers } from "../../factories/auth.factory";

const router = Router();
const controllers = makeAuthControllers();

router.post("/auth/register", (req, res) => controllers.register.handle(req, res));
router.post("/auth/login", (req, res) => controllers.login.handle(req, res));

export { router as authRoutes };

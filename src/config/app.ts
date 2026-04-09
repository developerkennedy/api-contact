import express from "express";
import { errorHandler } from "../http/middlewares/error-handler";
import { contactRoutes } from "../http/routes/contact.routes";
import { authRoutes } from "../http/routes/auth.routes";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authRoutes);
app.use(contactRoutes);

app.use(errorHandler);
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({ message: 'Validation error', errors: err.flatten().fieldErrors });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}

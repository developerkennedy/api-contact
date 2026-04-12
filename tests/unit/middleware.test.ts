import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../src/auth/middleware';
import { signToken } from '../../src/auth/jwt';
import { errorHandler } from '../../src/http/middlewares/error-handler';
import { AppError } from '../../src/shared/errors/AppError';
import { ZodError, z } from 'zod';

function mockReq(overrides: Partial<Request> = {}): Request {
    return {
        headers: {},
        id: 'test-request-id',
        method: 'GET',
        originalUrl: '/test',
        ...overrides,
    } as unknown as Request;
}

function mockRes(): Response {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
    return res as unknown as Response;
}

function mockNext(): NextFunction {
    return vi.fn();
}

describe('authenticate middleware', () => {
    it('rejects request without Authorization header', () => {
        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects request with non-Bearer scheme', () => {
        const req = mockReq({ headers: { authorization: 'Basic abc123' } });
        const res = mockRes();
        const next = mockNext();

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    });

    it('rejects request with "Bearer " but no token', () => {
        const req = mockReq({ headers: { authorization: 'Bearer ' } });
        const res = mockRes();
        const next = mockNext();

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('rejects request with invalid token', () => {
        const req = mockReq({ headers: { authorization: 'Bearer invalid-token' } });
        const res = mockRes();
        const next = mockNext();

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    });

    it('accepts valid Bearer token and sets req.user', () => {
        const token = signToken({ id: '11111111-1111-4111-8111-111111111111' });
        const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
        const res = mockRes();
        const next = mockNext();

        authenticate(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user!.id).toBe('11111111-1111-4111-8111-111111111111');
    });
});

describe('errorHandler middleware', () => {
    it('handles AppError', () => {
        const err = new AppError('Not found', 404);
        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
    });

    it('handles ZodError with 422', () => {
        const schema = z.object({ name: z.string().min(1) });
        let zodErr: ZodError | null = null;
        try {
            schema.parse({ name: '' });
        } catch (e) {
            zodErr = e as ZodError;
        }

        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        errorHandler(zodErr!, req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(jsonCall.message).toBe('Validation error');
        expect(jsonCall.errors).toBeDefined();
        expect(jsonCall.formErrors).toBeUndefined();
    });

    it('handles unknown errors with 500', () => {
        const err = new Error('unexpected');
        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
});

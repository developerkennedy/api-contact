import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';

const payloadSchema = z.object({
    id: z.uuid(),
});

export type IPayload = z.infer<typeof payloadSchema>;

export function signToken(payload: IPayload) {
    const token = jwt.sign(payload, env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '1h',
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
        subject: payload.id,
    });
    return token;
}

export function verifyToken(token: string): IPayload {
    const raw = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
    });
    return payloadSchema.parse(raw);
}

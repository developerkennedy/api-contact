import jwt from 'jsonwebtoken';
import { z } from 'zod';
import {env} from "../config/env";

const payloadSchema = z.object({
    id: z.string(),
    email: z.email(),
})

export type IPayload = z.infer<typeof payloadSchema>;

export function signToken(payload: IPayload) {
    const token = jwt.sign(payload, env.JWT_SECRET,{
        expiresIn:'1h'
    })
    return token;
}

export function verifyToken(token: string): IPayload {
    const raw = jwt.verify(token, env.JWT_SECRET)
    return payloadSchema.parse(raw)
}
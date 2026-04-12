import { z } from 'zod';

export const refreshTokenSchema = z.object({
    id: z.uuid(),
    token_hash: z.string().length(64),
    user_id: z.uuid(),
    family_id: z.uuid(),
    is_rotated: z.boolean(),
    created_at: z.date(),
    expires_at: z.date(),
});

export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;

export type CreateRefreshTokenDTO = Omit<RefreshTokenDTO, 'id' | 'created_at' | 'is_rotated'>;

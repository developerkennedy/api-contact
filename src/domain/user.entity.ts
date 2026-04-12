import { z } from 'zod';

export const UserSchema = z.object({
    id: z.uuid(),
    name: z.string().min(3),
    email: z.email(),
    password: z.string().max(128),
});

export const createUserSchema = UserSchema.omit({ id: true });
export type UserDTO = z.infer<typeof UserSchema>;
export type CreateUserDTO = z.infer<typeof createUserSchema>;
export const userResponseSchema = UserSchema.omit({ password: true });
export type UserResponseDTO = z.infer<typeof userResponseSchema>;

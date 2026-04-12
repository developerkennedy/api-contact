import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().trim().min(3).max(100),
    email: z.email().max(255),
    password: z
        .string()
        .min(8, 'Senha deve ter ao menos 8 caracteres')
        .max(128)
        .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
        .regex(/[0-9]/, 'Senha deve conter ao menos um número')
        .regex(/[^A-Za-z0-9]/, 'Senha deve conter ao menos um caractere especial'),
});

export const loginSchema = z.object({
    email: z.email().max(255),
    password: z.string().min(8).max(128),
});

export const refreshSchema = z.object({
    refresh_token: z.string().uuid('Invalid refresh token format'),
});

export const logoutSchema = z.object({
    refresh_token: z.string().uuid('Invalid refresh token format'),
});

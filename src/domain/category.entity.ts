import { z } from 'zod';

const categoryNameSchema = z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(255, 'Name must be at most 255 characters');

export const CategorySchema = z.object({
    id: z.uuid(),
    name: categoryNameSchema,
    user_id: z.uuid(),
});

export const createCategorySchema = CategorySchema.omit({ id: true });
export const updateCategorySchema = CategorySchema.omit({ id: true, user_id: true })
    .partial()
    .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        'At least one field must be provided'
    );
export type CategoryDTO = z.infer<typeof CategorySchema>;
export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

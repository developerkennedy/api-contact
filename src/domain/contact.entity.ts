import { z } from 'zod';

const contactNameSchema = z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(255, 'Name must be at most 255 characters');

const contactEmailSchema = z.email().max(255, 'Email must be at most 255 characters');

export const ContactSchema = z.object({
    id: z.uuid(),
    name: contactNameSchema,
    email: contactEmailSchema,
    user_id: z.uuid(),
});

export const createContactSchema = ContactSchema.omit({ id: true }).extend({
    category_ids: z.array(z.uuid()).optional(),
});

export const updateContactSchema = ContactSchema.omit({ user_id: true, id: true })
    .partial()
    .extend({
        category_ids: z.array(z.uuid()).optional(),
    })
    .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        'At least one field must be provided'
    );

export type ContactDTO = z.infer<typeof ContactSchema>;
export type CreateContactDto = z.infer<typeof createContactSchema>;
export type UpdateContactDto = z.infer<typeof updateContactSchema>;

export interface ContactWithCategories extends ContactDTO {
    categories: { id: string; name: string }[];
}

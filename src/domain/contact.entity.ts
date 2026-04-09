import {z} from "zod";

export const ContactSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    user_id: z.string(),
})

export const createContactSchema = ContactSchema.omit({id:true})
export const updateContactSchema = ContactSchema.omit({user_id:true, id:true}).partial()
export type ContactDTO = z.infer<typeof ContactSchema>
export type CreateContactDto = z.infer<typeof createContactSchema>
export type UpdateContactDto = z.infer<typeof updateContactSchema>
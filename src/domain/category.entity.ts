import {z} from "zod";

export const CategorySchema = z.object({
    id: z.uuid(),
    name: z.string(),
})

export const createCategorySchema = CategorySchema.omit({id:true})

export type CategoryDTO = z.infer<typeof CategorySchema>
export type CreateCategoryDto = z.infer<typeof createCategorySchema>
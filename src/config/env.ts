import dotenv from 'dotenv';
dotenv.config();
import {z} from 'zod'

const envSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(10)
})


export const env = envSchema.parse(process.env);
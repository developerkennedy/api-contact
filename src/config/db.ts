import { env } from './env';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../domain/contact.schema';

export const queryClient = postgres(env.DATABASE_URL, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
});
export const db = drizzle({ client: queryClient, schema });

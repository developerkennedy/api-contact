import {IContactRepository} from "./interfaces/IContactRepository";
import {ContactDTO, CreateContactDto, UpdateContactDto} from "../../domain/contact.entity";
import {db} from "../../config/db";
import {contactsTable} from "../../domain/contact.schema";
import {and, count, eq} from "drizzle-orm";
import {PaginationParams, PaginationResult} from "../../shared/types/pagination";

export class ContactRepository implements IContactRepository {
   async create(values: CreateContactDto): Promise<ContactDTO> {
     const [contactCreated] =  await db.insert(contactsTable).values(values).returning()
       return contactCreated
    }
    async findAll(user_id:string, {limit,offset}: PaginationParams): Promise<PaginationResult<ContactDTO>> {
        const [data,[{total}]] = await Promise.all([
            db.query.contactsTable.findMany({
                where: eq(contactsTable.user_id, user_id),
                limit,
                offset,
            }),
            db.select({total: count()}).from(contactsTable).where(eq(contactsTable.user_id,user_id))
        ])
        return {data,total,limit,offset};

    }

    async findById(id: string, user_id: string): Promise<ContactDTO | null> {
       const contact = await db.query.contactsTable.findFirst({
           where: and(eq(contactsTable.id, id), eq(contactsTable.user_id, user_id)),
       })
        return contact ?? null
    }

    async findByEmail(email: string, user_id: string): Promise<ContactDTO | null> {
        const contact = await db.query.contactsTable.findFirst({
            where: and(eq(contactsTable.email, email), eq(contactsTable.user_id, user_id)),
        })
        return contact ?? null
    }

    async delete(id: string, user_id: string): Promise<void> {
        await db.delete(contactsTable).where(and(eq(contactsTable.id, id), eq(contactsTable.user_id, user_id)))
    }

    async update(user_id: string, id: string, data: UpdateContactDto): Promise<ContactDTO | null> {
       const [contact] = await db.update(contactsTable).set(data)
           .where(and(eq(contactsTable.user_id, user_id), eq(contactsTable.id, id))).returning();
       return contact ?? null
    }
}
import { IContactRepository } from './interfaces/IContactRepository';
import {
    ContactDTO,
    ContactWithCategories,
    CreateContactDto,
    UpdateContactDto,
} from '../../domain/contact.entity';
import { db } from '../../config/db';
import {
    contactsTable,
    contactsCategoriesTable,
    categoriesTable,
} from '../../domain/contact.schema';
import { and, count, eq, inArray, isNull, desc } from 'drizzle-orm';
import { PaginationParams, PaginationResult } from '../../shared/types/pagination';
import { AppError } from '../../shared/errors/AppError';

const notDeleted = isNull(contactsTable.deleted_at);

export class ContactRepository implements IContactRepository {
    private mapContactWithCategories(contact: {
        id: string;
        name: string;
        email: string;
        user_id: string;
        categories: { category: { id: string; name: string; deleted_at: Date | null } }[];
    }): ContactWithCategories {
        return {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            user_id: contact.user_id,
            categories: contact.categories
                .filter((cc) => cc.category.deleted_at === null)
                .map((cc) => ({
                    id: cc.category.id,
                    name: cc.category.name,
                })),
        };
    }

    async createWithCategories(values: CreateContactDto): Promise<ContactWithCategories> {
        const contactId = await db.transaction(async (tx) => {
            const { category_ids = [], ...contactData } = values;

            if (category_ids.length > 0) {
                const validCategories = await tx
                    .select({ id: categoriesTable.id })
                    .from(categoriesTable)
                    .where(
                        and(
                            inArray(categoriesTable.id, category_ids),
                            eq(categoriesTable.user_id, values.user_id),
                            isNull(categoriesTable.deleted_at)
                        )
                    );

                if (validCategories.length !== category_ids.length) {
                    throw new AppError(
                        'One or more categories not found or not owned by user',
                        400
                    );
                }
            }

            const [contactCreated] = await tx.insert(contactsTable).values(contactData).returning();

            if (category_ids.length > 0) {
                await tx.insert(contactsCategoriesTable).values(
                    category_ids.map((category_id) => ({
                        contact_id: contactCreated.id,
                        category_id,
                    }))
                );
            }

            return contactCreated.id;
        });

        const contact = await this.findById(contactId, values.user_id);

        if (!contact) {
            throw new AppError('Contact not found after creation', 500);
        }

        return contact;
    }

    async findAll(
        user_id: string,
        { limit, offset }: PaginationParams
    ): Promise<PaginationResult<ContactWithCategories>> {
        const whereClause = and(eq(contactsTable.user_id, user_id), notDeleted);
        const [data, [{ total }]] = await Promise.all([
            db.query.contactsTable.findMany({
                where: whereClause,
                limit,
                offset,
                orderBy: desc(contactsTable.created_at),
                with: {
                    categories: {
                        with: { category: true },
                    },
                },
            }),
            db.select({ total: count() }).from(contactsTable).where(whereClause),
        ]);

        const mapped = data.map((contact) => this.mapContactWithCategories(contact));

        return { data: mapped, total, limit, offset };
    }

    async findById(id: string, user_id: string): Promise<ContactWithCategories | null> {
        const contact = await db.query.contactsTable.findFirst({
            where: and(eq(contactsTable.id, id), eq(contactsTable.user_id, user_id), notDeleted),
            with: {
                categories: {
                    with: { category: true },
                },
            },
        });

        if (!contact) return null;

        return this.mapContactWithCategories(contact);
    }

    async findByEmail(email: string, user_id: string): Promise<ContactDTO | null> {
        const contact = await db.query.contactsTable.findFirst({
            where: and(
                eq(contactsTable.email, email),
                eq(contactsTable.user_id, user_id),
                notDeleted
            ),
        });
        return contact ?? null;
    }

    async delete(id: string, user_id: string): Promise<void> {
        await db
            .update(contactsTable)
            .set({ deleted_at: new Date() })
            .where(and(eq(contactsTable.id, id), eq(contactsTable.user_id, user_id), notDeleted));
    }

    async updateWithCategories(
        user_id: string,
        id: string,
        data: UpdateContactDto
    ): Promise<ContactWithCategories | null> {
        const updatedContactId = await db.transaction(async (tx) => {
            const { category_ids, ...contactData } = data;
            const [contact] = await tx
                .update(contactsTable)
                .set({ ...contactData, updated_at: new Date() })
                .where(
                    and(eq(contactsTable.user_id, user_id), eq(contactsTable.id, id), notDeleted)
                )
                .returning();

            if (!contact) {
                return null;
            }

            if (category_ids !== undefined) {
                if (category_ids.length > 0) {
                    const validCategories = await tx
                        .select({ id: categoriesTable.id })
                        .from(categoriesTable)
                        .where(
                            and(
                                inArray(categoriesTable.id, category_ids),
                                eq(categoriesTable.user_id, user_id),
                                isNull(categoriesTable.deleted_at)
                            )
                        );

                    if (validCategories.length !== category_ids.length) {
                        throw new AppError(
                            'One or more categories not found or not owned by user',
                            400
                        );
                    }
                }

                const currentRelations = await tx
                    .select({ category_id: contactsCategoriesTable.category_id })
                    .from(contactsCategoriesTable)
                    .where(eq(contactsCategoriesTable.contact_id, id));

                const currentIds = new Set(currentRelations.map((r) => r.category_id));
                const newIds = new Set(category_ids);

                const toAdd = category_ids.filter((cid) => !currentIds.has(cid));
                const toRemove = currentRelations
                    .map((r) => r.category_id)
                    .filter((cid) => !newIds.has(cid));

                if (toRemove.length > 0) {
                    await tx
                        .delete(contactsCategoriesTable)
                        .where(
                            and(
                                eq(contactsCategoriesTable.contact_id, id),
                                inArray(contactsCategoriesTable.category_id, toRemove)
                            )
                        );
                }

                if (toAdd.length > 0) {
                    await tx
                        .insert(contactsCategoriesTable)
                        .values(toAdd.map((category_id) => ({ contact_id: id, category_id })));
                }
            }

            return contact.id;
        });

        if (!updatedContactId) {
            return null;
        }

        return this.findById(updatedContactId, user_id);
    }
}

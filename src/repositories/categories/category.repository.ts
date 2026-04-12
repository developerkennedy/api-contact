import { and, eq, isNull, count, desc } from 'drizzle-orm';
import { db } from '../../config/db';
import { CreateCategoryDto, CategoryDTO, UpdateCategoryDto } from '../../domain/category.entity';
import { categoriesTable, contactsCategoriesTable } from '../../domain/contact.schema';
import { PaginationParams, PaginationResult } from '../../shared/types/pagination';
import { ICategoryRepository } from './interface/ICategoryRepository';

const notDeleted = isNull(categoriesTable.deleted_at);
export class CategoryRepository implements ICategoryRepository {
    async create(data: CreateCategoryDto): Promise<CategoryDTO> {
        const [category] = await db.insert(categoriesTable).values(data).returning();
        return category ?? null;
    }
    async findAll(
        user_id: string,
        { limit, offset }: PaginationParams
    ): Promise<PaginationResult<CategoryDTO>> {
        const whereClause = and(eq(categoriesTable.user_id, user_id), notDeleted);

        const [data, [{ total }]] = await Promise.all([
            db.query.categoriesTable.findMany({
                where: whereClause,
                limit,
                offset,
                orderBy: desc(categoriesTable.created_at),
            }),
            db.select({ total: count() }).from(categoriesTable).where(whereClause),
        ]);

        return { data, total, limit, offset };
    }
    async findByName(name: string, user_id: string): Promise<CategoryDTO | null> {
        const category = await db.query.categoriesTable.findFirst({
            where: and(
                eq(categoriesTable.name, name),
                eq(categoriesTable.user_id, user_id),
                notDeleted
            ),
        });
        return category ?? null;
    }
    async findById(id: string, user_id: string): Promise<CategoryDTO | null> {
        const category = await db.query.categoriesTable.findFirst({
            where: and(
                eq(categoriesTable.user_id, user_id),
                eq(categoriesTable.id, id),
                notDeleted
            ),
        });
        return category ?? null;
    }
    async delete(id: string, user_id: string): Promise<void> {
        await db.transaction(async (tx) => {
            await tx
                .update(categoriesTable)
                .set({
                    deleted_at: new Date(),
                    updated_at: new Date(),
                })
                .where(
                    and(
                        eq(categoriesTable.user_id, user_id),
                        eq(categoriesTable.id, id),
                        notDeleted
                    )
                );

            await tx
                .delete(contactsCategoriesTable)
                .where(eq(contactsCategoriesTable.category_id, id));
        });
    }
    async update(
        id: string,
        user_id: string,
        data: UpdateCategoryDto
    ): Promise<CategoryDTO | null> {
        const [category] = await db
            .update(categoriesTable)
            .set({
                ...data,
                updated_at: new Date(),
            })
            .where(
                and(eq(categoriesTable.user_id, user_id), eq(categoriesTable.id, id), notDeleted)
            )
            .returning();
        return category ?? null;
    }
}

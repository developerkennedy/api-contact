import { describe, it, expect } from 'vitest';
import { CreateCategory } from '../../src/use-cases/category/create-category';
import { UpdateCategory } from '../../src/use-cases/category/update-category';
import { DeleteCategory } from '../../src/use-cases/category/delete-category';
import { GetCategory } from '../../src/use-cases/category/get-category';
import { ListCategories } from '../../src/use-cases/category/list-categories';
import { AppError } from '../../src/shared/errors/AppError';
import {
    createCategorySchema,
    updateCategorySchema,
    CategoryDTO,
} from '../../src/domain/category.entity';
import { ICategoryRepository } from '../../src/repositories/categories/interface/ICategoryRepository';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const CATEGORY_ID = '66666666-6666-4666-8666-666666666666';

function makeCategoryRepository(
    overrides: Partial<ICategoryRepository> = {}
): ICategoryRepository {
    return {
        async create(data) {
            return { id: CATEGORY_ID, ...data } as CategoryDTO;
        },
        async findById() {
            return null;
        },
        async findByName() {
            return null;
        },
        async findAll() {
            throw new Error('not implemented');
        },
        async delete() {},
        async update() {
            return null;
        },
        ...overrides,
    };
}

function makeCategory(overrides: Partial<CategoryDTO> = {}): CategoryDTO {
    return {
        id: CATEGORY_ID,
        name: 'VIP Clients',
        user_id: USER_ID,
        ...overrides,
    };
}

describe('Category Schema Validation', () => {
    it('createCategorySchema rejects empty names after trimming', () => {
        expect(() =>
            createCategorySchema.parse({
                name: '   ',
                user_id: USER_ID,
            })
        ).toThrow(/Name is required/);
    });

    it('updateCategorySchema rejects empty payloads', () => {
        const result = updateCategorySchema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().formErrors[0]).toBe(
                'At least one field must be provided'
            );
        }
    });
});

describe('CreateCategory', () => {
    it('trims the name before persisting', async () => {
        let createdPayload: Record<string, unknown> | null = null;

        const repository = makeCategoryRepository({
            async create(data) {
                createdPayload = data as unknown as Record<string, unknown>;
                return { id: CATEGORY_ID, ...data } as CategoryDTO;
            },
        });

        const useCase = new CreateCategory(repository);
        const result = await useCase.execute({
            name: '  VIP Clients  ',
            user_id: USER_ID,
        });

        expect(result.name).toBe('VIP Clients');
        expect(createdPayload).toBeTruthy();
        expect(createdPayload!.name).toBe('VIP Clients');
    });

    it('rejects duplicate names for the same user', async () => {
        const repository = makeCategoryRepository({
            async findByName(name) {
                return makeCategory({ name });
            },
        });

        const useCase = new CreateCategory(repository);

        try {
            await useCase.execute({ name: 'VIP Clients', user_id: USER_ID });
            expect.fail('should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(409);
            expect((error as AppError).message).toBe('A category with this name already exists');
        }
    });
});

describe('UpdateCategory', () => {
    it('rejects missing categories', async () => {
        const repository = makeCategoryRepository();
        const useCase = new UpdateCategory(repository);

        try {
            await useCase.execute(CATEGORY_ID, USER_ID, { name: 'Updated' });
            expect.fail('should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(404);
            expect((error as AppError).message).toBe('Category not found');
        }
    });

    it('trims the name before updating', async () => {
        let updatedPayload: Record<string, unknown> | null = null;

        const repository = makeCategoryRepository({
            async findById() {
                return makeCategory();
            },
            async update(_id, _userId, data) {
                updatedPayload = data as unknown as Record<string, unknown>;
                return makeCategory({ name: data.name ?? 'VIP Clients' });
            },
        });

        const useCase = new UpdateCategory(repository);
        const result = await useCase.execute(CATEGORY_ID, USER_ID, {
            name: '  Priority  ',
        });

        expect(result!.name).toBe('Priority');
        expect(updatedPayload).toBeTruthy();
        expect(updatedPayload!.name).toBe('Priority');
    });
});

describe('DeleteCategory', () => {
    it('calls repository delete', async () => {
        let deletedId: string | null = null;

        const repository = makeCategoryRepository({
            async findById() {
                return makeCategory();
            },
            async delete(id) {
                deletedId = id;
            },
        });

        const useCase = new DeleteCategory(repository);
        await useCase.execute(CATEGORY_ID, USER_ID);

        expect(deletedId).toBe(CATEGORY_ID);
    });

    it('rejects missing categories', async () => {
        const repository = makeCategoryRepository();
        const useCase = new DeleteCategory(repository);

        try {
            await useCase.execute(CATEGORY_ID, USER_ID);
            expect.fail('should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(404);
        }
    });
});

describe('GetCategory', () => {
    it('returns category when found', async () => {
        const repository = makeCategoryRepository({
            async findById() {
                return makeCategory();
            },
        });

        const useCase = new GetCategory(repository);
        const result = await useCase.execute(CATEGORY_ID, USER_ID);

        expect(result.id).toBe(CATEGORY_ID);
        expect(result.name).toBe('VIP Clients');
    });

    it('rejects missing categories', async () => {
        const repository = makeCategoryRepository();
        const useCase = new GetCategory(repository);

        try {
            await useCase.execute(CATEGORY_ID, USER_ID);
            expect.fail('should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(404);
        }
    });
});

describe('ListCategories', () => {
    it('returns paginated results', async () => {
        const repository = makeCategoryRepository({
            async findAll(_user_id, pagination) {
                return {
                    data: [makeCategory()],
                    total: 1,
                    limit: pagination.limit,
                    offset: pagination.offset,
                };
            },
        });

        const useCase = new ListCategories(repository);
        const result = await useCase.execute(USER_ID, { limit: 10, offset: 0 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
    });
});

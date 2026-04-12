import { describe, it, expect } from 'vitest';
import { CreateContact } from '../../src/use-cases/contact/create-contact';
import { UpdateContact } from '../../src/use-cases/contact/update-contact';
import { DeleteContact } from '../../src/use-cases/contact/delete-contact';
import { GetContact } from '../../src/use-cases/contact/get-contact';
import { ListContacts } from '../../src/use-cases/contact/list-contacts';
import { AppError } from '../../src/shared/errors/AppError';
import {
    createContactSchema,
    updateContactSchema,
    ContactWithCategories,
} from '../../src/domain/contact.entity';
import { IContactRepository } from '../../src/repositories/contact/interfaces/IContactRepository';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const CONTACT_ID = '33333333-3333-4333-8333-333333333333';

function makeContactRepository(
    overrides: Partial<IContactRepository> = {}
): IContactRepository {
    return {
        async createWithCategories() {
            throw new Error('not implemented');
        },
        async findAll() {
            throw new Error('not implemented');
        },
        async findById() {
            return null;
        },
        async findByEmail() {
            return null;
        },
        async delete() {},
        async updateWithCategories() {
            return null;
        },
        ...overrides,
    };
}

function makeContact(overrides: Partial<ContactWithCategories> = {}): ContactWithCategories {
    return {
        id: CONTACT_ID,
        name: 'Alice',
        email: 'alice@example.com',
        user_id: USER_ID,
        categories: [],
        ...overrides,
    };
}

describe('Contact Schema Validation', () => {
    it('createContactSchema rejects empty names after trimming', () => {
        expect(() =>
            createContactSchema.parse({
                name: '   ',
                email: 'alice@example.com',
                user_id: USER_ID,
            })
        ).toThrow(/Name is required/);
    });

    it('updateContactSchema rejects empty payloads', () => {
        const result = updateContactSchema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().formErrors[0]).toBe(
                'At least one field must be provided'
            );
        }
    });
});

describe('CreateContact', () => {
    it('normalizes email and delegates to transactional repository method', async () => {
        let createdPayload: Record<string, unknown> | null = null;

        const repository = makeContactRepository({
            async createWithCategories(data) {
                createdPayload = data as unknown as Record<string, unknown>;
                return makeContact({ email: data.email });
            },
        });

        const useCase = new CreateContact(repository);
        const result = await useCase.execute({
            name: 'Alice',
            email: '  Alice@Example.COM ',
            user_id: USER_ID,
            category_ids: ['44444444-4444-4444-8444-444444444444'],
        });

        expect(result.email).toBe('alice@example.com');
        expect(createdPayload).toBeTruthy();
        expect(createdPayload!.email).toBe('alice@example.com');
        expect(createdPayload!.category_ids).toEqual(['44444444-4444-4444-8444-444444444444']);
    });

    it('rejects duplicate email for the same user', async () => {
        const repository = makeContactRepository({
            async findByEmail(email) {
                return { id: CONTACT_ID, name: 'Alice', email, user_id: USER_ID };
            },
        });

        const useCase = new CreateContact(repository);

        try {
            await useCase.execute({
                name: 'Alice',
                email: 'alice@example.com',
                user_id: USER_ID,
            });
            expect.fail('should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(409);
            expect((error as AppError).message).toBe('A contact with this email already exists');
        }
    });
});

describe('UpdateContact', () => {
    it('rejects missing contacts', async () => {
        const repository = makeContactRepository();
        const useCase = new UpdateContact(repository);

        try {
            await useCase.execute(CONTACT_ID, USER_ID, { name: 'Updated' });
            expect.fail('should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(404);
            expect((error as AppError).message).toBe('Contact not found');
        }
    });

    it('normalizes email and forwards category changes', async () => {
        let updatedPayload: Record<string, unknown> | null = null;

        const repository = makeContactRepository({
            async findById() {
                return makeContact();
            },
            async updateWithCategories(_userId, _id, data) {
                updatedPayload = data as unknown as Record<string, unknown>;
                return makeContact({ email: data.email ?? 'alice@example.com' });
            },
        });

        const useCase = new UpdateContact(repository);
        const result = await useCase.execute(CONTACT_ID, USER_ID, {
            email: '  New@Example.COM ',
            category_ids: ['55555555-5555-4555-8555-555555555555'],
        });

        expect(result.email).toBe('new@example.com');
        expect(updatedPayload).toBeTruthy();
        expect(updatedPayload!.email).toBe('new@example.com');
        expect(updatedPayload!.category_ids).toEqual(['55555555-5555-4555-8555-555555555555']);
    });
});

describe('DeleteContact', () => {
    it('calls repository delete', async () => {
        let deletedId: string | null = null;
        let deletedUserId: string | null = null;

        const repository = makeContactRepository({
            async findById() {
                return makeContact();
            },
            async delete(id, user_id) {
                deletedId = id;
                deletedUserId = user_id;
            },
        });

        const useCase = new DeleteContact(repository);
        await useCase.execute(CONTACT_ID, USER_ID);

        expect(deletedId).toBe(CONTACT_ID);
        expect(deletedUserId).toBe(USER_ID);
    });

    it('rejects missing contacts', async () => {
        const repository = makeContactRepository();
        const useCase = new DeleteContact(repository);

        try {
            await useCase.execute(CONTACT_ID, USER_ID);
            expect.fail('should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(404);
        }
    });
});

describe('GetContact', () => {
    it('returns contact when found', async () => {
        const repository = makeContactRepository({
            async findById() {
                return makeContact();
            },
        });

        const useCase = new GetContact(repository);
        const result = await useCase.execute(CONTACT_ID, USER_ID);

        expect(result.id).toBe(CONTACT_ID);
        expect(result.name).toBe('Alice');
    });

    it('rejects missing contacts', async () => {
        const repository = makeContactRepository();
        const useCase = new GetContact(repository);

        try {
            await useCase.execute(CONTACT_ID, USER_ID);
            expect.fail('should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(404);
        }
    });
});

describe('ListContacts', () => {
    it('returns paginated results', async () => {
        const repository = makeContactRepository({
            async findAll(_user_id, pagination) {
                return {
                    data: [makeContact()],
                    total: 1,
                    limit: pagination.limit,
                    offset: pagination.offset,
                };
            },
        });

        const useCase = new ListContacts(repository);
        const result = await useCase.execute(USER_ID, { limit: 10, offset: 0 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.limit).toBe(10);
        expect(result.offset).toBe(0);
    });
});

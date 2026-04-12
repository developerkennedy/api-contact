const assert = require('node:assert/strict');
const { bootstrapEnv } = require('./helpers/bootstrap-env.cjs');

bootstrapEnv();

const { CreateContact } = require('../dist/use-cases/contact/create-contact');
const { UpdateContact } = require('../dist/use-cases/contact/update-contact');
const { AppError } = require('../dist/shared/errors/AppError');
const {
    createContactSchema,
    updateContactSchema,
} = require('../dist/domain/contact.entity');

module.exports = async function runContactUseCaseTests(run) {
    await run('createContactSchema rejects empty names after trimming', async () => {
        assert.throws(
            () =>
                createContactSchema.parse({
                    name: '   ',
                    email: 'alice@example.com',
                    user_id: '11111111-1111-4111-8111-111111111111',
                }),
            /Name is required/
        );
    });

    await run('updateContactSchema rejects empty payloads', async () => {
        const result = updateContactSchema.safeParse({});

        assert.equal(result.success, false);
        assert.equal(result.error.flatten().formErrors[0], 'At least one field must be provided');
    });

    await run(
        'CreateContact normalizes email and delegates to transactional repository method',
        async () => {
            let createdPayload = null;

            const repository = {
                async findByEmail() {
                    return null;
                },
                async createWithCategories(data) {
                    createdPayload = data;
                    return {
                        id: '33333333-3333-4333-8333-333333333333',
                        name: data.name,
                        email: data.email,
                        user_id: data.user_id,
                        categories: [],
                    };
                },
                async findAll() {
                    throw new Error('findAll should not be called');
                },
                async findById() {
                    throw new Error('findById should not be called');
                },
                async delete() {
                    throw new Error('delete should not be called');
                },
                async updateWithCategories() {
                    throw new Error('updateWithCategories should not be called');
                },
            };

            const useCase = new CreateContact(repository);
            const result = await useCase.execute({
                name: 'Alice',
                email: '  Alice@Example.COM ',
                user_id: '11111111-1111-4111-8111-111111111111',
                category_ids: ['44444444-4444-4444-8444-444444444444'],
            });

            assert.equal(result.email, 'alice@example.com');
            assert.ok(createdPayload);
            assert.equal(createdPayload.email, 'alice@example.com');
            assert.deepEqual(createdPayload.category_ids, [
                '44444444-4444-4444-8444-444444444444',
            ]);
        }
    );

    await run('CreateContact rejects duplicate email for the same user', async () => {
        const repository = {
            async findByEmail(email) {
                return {
                    id: '33333333-3333-4333-8333-333333333333',
                    name: 'Alice',
                    email,
                    user_id: '11111111-1111-4111-8111-111111111111',
                };
            },
            async createWithCategories() {
                throw new Error('createWithCategories should not be called');
            },
            async findAll() {
                throw new Error('findAll should not be called');
            },
            async findById() {
                throw new Error('findById should not be called');
            },
            async delete() {
                throw new Error('delete should not be called');
            },
            async updateWithCategories() {
                throw new Error('updateWithCategories should not be called');
            },
        };

        const useCase = new CreateContact(repository);

        await assert.rejects(
            () =>
                useCase.execute({
                    name: 'Alice',
                    email: 'alice@example.com',
                    user_id: '11111111-1111-4111-8111-111111111111',
                }),
            (error) => {
                assert.ok(error instanceof AppError);
                assert.equal(error.statusCode, 409);
                assert.equal(error.message, 'A contact with this email already exists');
                return true;
            }
        );
    });

    await run('UpdateContact rejects missing contacts', async () => {
        const repository = {
            async findById() {
                return null;
            },
            async findByEmail() {
                throw new Error('findByEmail should not be called');
            },
            async updateWithCategories() {
                throw new Error('updateWithCategories should not be called');
            },
            async createWithCategories() {
                throw new Error('createWithCategories should not be called');
            },
            async findAll() {
                throw new Error('findAll should not be called');
            },
            async delete() {
                throw new Error('delete should not be called');
            },
        };

        const useCase = new UpdateContact(repository);

        await assert.rejects(
            () =>
                useCase.execute(
                    '33333333-3333-4333-8333-333333333333',
                    '11111111-1111-4111-8111-111111111111',
                    { name: 'Updated' }
                ),
            (error) => {
                assert.ok(error instanceof AppError);
                assert.equal(error.statusCode, 404);
                assert.equal(error.message, 'Contact not found');
                return true;
            }
        );
    });

    await run('UpdateContact normalizes email and forwards category changes', async () => {
        let updatedPayload = null;

        const repository = {
            async findById() {
                return {
                    id: '33333333-3333-4333-8333-333333333333',
                    name: 'Alice',
                    email: 'alice@example.com',
                    user_id: '11111111-1111-4111-8111-111111111111',
                    categories: [],
                };
            },
            async findByEmail() {
                return null;
            },
            async updateWithCategories(_userId, _id, data) {
                updatedPayload = data;
                return {
                    id: '33333333-3333-4333-8333-333333333333',
                    name: 'Alice Updated',
                    email: data.email,
                    user_id: '11111111-1111-4111-8111-111111111111',
                    categories: [],
                };
            },
            async createWithCategories() {
                throw new Error('createWithCategories should not be called');
            },
            async findAll() {
                throw new Error('findAll should not be called');
            },
            async delete() {
                throw new Error('delete should not be called');
            },
        };

        const useCase = new UpdateContact(repository);
        const result = await useCase.execute(
            '33333333-3333-4333-8333-333333333333',
            '11111111-1111-4111-8111-111111111111',
            {
                email: '  New@Example.COM ',
                category_ids: ['55555555-5555-4555-8555-555555555555'],
            }
        );

        assert.equal(result.email, 'new@example.com');
        assert.ok(updatedPayload);
        assert.equal(updatedPayload.email, 'new@example.com');
        assert.deepEqual(updatedPayload.category_ids, ['55555555-5555-4555-8555-555555555555']);
    });
};

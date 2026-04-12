const assert = require('node:assert/strict');
const { bootstrapEnv } = require('./helpers/bootstrap-env.cjs');

bootstrapEnv();

const { CreateCategory } = require('../dist/use-cases/category/create-category');
const { UpdateCategory } = require('../dist/use-cases/category/update-category');
const { AppError } = require('../dist/shared/errors/AppError');
const {
    createCategorySchema,
    updateCategorySchema,
} = require('../dist/domain/category.entity');

module.exports = async function runCategoryUseCaseTests(run) {
    await run('createCategorySchema rejects empty names after trimming', async () => {
        assert.throws(
            () =>
                createCategorySchema.parse({
                    name: '   ',
                    user_id: '11111111-1111-4111-8111-111111111111',
                }),
            /Name is required/
        );
    });

    await run('updateCategorySchema rejects empty payloads', async () => {
        const result = updateCategorySchema.safeParse({});

        assert.equal(result.success, false);
        assert.equal(result.error.flatten().formErrors[0], 'At least one field must be provided');
    });

    await run('CreateCategory trims the name before persisting', async () => {
        let createdPayload = null;

        const repository = {
            async findByName() {
                return null;
            },
            async create(data) {
                createdPayload = data;
                return {
                    id: '66666666-6666-4666-8666-666666666666',
                    ...data,
                };
            },
            async findById() {
                throw new Error('findById should not be called');
            },
            async findAll() {
                throw new Error('findAll should not be called');
            },
            async delete() {
                throw new Error('delete should not be called');
            },
            async update() {
                throw new Error('update should not be called');
            },
        };

        const useCase = new CreateCategory(repository);
        const result = await useCase.execute({
            name: '  VIP Clients  ',
            user_id: '11111111-1111-4111-8111-111111111111',
        });

        assert.equal(result.name, 'VIP Clients');
        assert.ok(createdPayload);
        assert.equal(createdPayload.name, 'VIP Clients');
    });

    await run('CreateCategory rejects duplicate names for the same user', async () => {
        const repository = {
            async findByName(name) {
                return {
                    id: '66666666-6666-4666-8666-666666666666',
                    name,
                    user_id: '11111111-1111-4111-8111-111111111111',
                };
            },
            async create() {
                throw new Error('create should not be called');
            },
            async findById() {
                throw new Error('findById should not be called');
            },
            async findAll() {
                throw new Error('findAll should not be called');
            },
            async delete() {
                throw new Error('delete should not be called');
            },
            async update() {
                throw new Error('update should not be called');
            },
        };

        const useCase = new CreateCategory(repository);

        await assert.rejects(
            () =>
                useCase.execute({
                    name: 'VIP Clients',
                    user_id: '11111111-1111-4111-8111-111111111111',
                }),
            (error) => {
                assert.ok(error instanceof AppError);
                assert.equal(error.statusCode, 409);
                assert.equal(error.message, 'A category with this name already exists');
                return true;
            }
        );
    });

    await run('UpdateCategory rejects missing categories', async () => {
        const repository = {
            async findById() {
                return null;
            },
            async findByName() {
                throw new Error('findByName should not be called');
            },
            async update() {
                throw new Error('update should not be called');
            },
            async create() {
                throw new Error('create should not be called');
            },
            async findAll() {
                throw new Error('findAll should not be called');
            },
            async delete() {
                throw new Error('delete should not be called');
            },
        };

        const useCase = new UpdateCategory(repository);

        await assert.rejects(
            () =>
                useCase.execute(
                    '66666666-6666-4666-8666-666666666666',
                    '11111111-1111-4111-8111-111111111111',
                    { name: 'Updated' }
                ),
            (error) => {
                assert.ok(error instanceof AppError);
                assert.equal(error.statusCode, 404);
                assert.equal(error.message, 'Category not found');
                return true;
            }
        );
    });

    await run('UpdateCategory trims the name before updating', async () => {
        let updatedPayload = null;

        const repository = {
            async findById() {
                return {
                    id: '66666666-6666-4666-8666-666666666666',
                    name: 'VIP Clients',
                    user_id: '11111111-1111-4111-8111-111111111111',
                };
            },
            async findByName() {
                return null;
            },
            async update(_id, _userId, data) {
                updatedPayload = data;
                return {
                    id: '66666666-6666-4666-8666-666666666666',
                    name: data.name,
                    user_id: '11111111-1111-4111-8111-111111111111',
                };
            },
            async create() {
                throw new Error('create should not be called');
            },
            async findAll() {
                throw new Error('findAll should not be called');
            },
            async delete() {
                throw new Error('delete should not be called');
            },
        };

        const useCase = new UpdateCategory(repository);
        const result = await useCase.execute(
            '66666666-6666-4666-8666-666666666666',
            '11111111-1111-4111-8111-111111111111',
            { name: '  Priority  ' }
        );

        assert.equal(result.name, 'Priority');
        assert.ok(updatedPayload);
        assert.equal(updatedPayload.name, 'Priority');
    });
};

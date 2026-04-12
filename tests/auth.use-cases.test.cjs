const assert = require('node:assert/strict');
const { bootstrapEnv } = require('./helpers/bootstrap-env.cjs');

bootstrapEnv();

const { Register } = require('../dist/use-cases/auth/register');
const { Login } = require('../dist/use-cases/auth/login');
const { AppError } = require('../dist/shared/errors/AppError');
const { comparePassword, hash } = require('../dist/shared/utils/hash');
const { verifyToken } = require('../dist/auth/jwt');

module.exports = async function runAuthUseCaseTests(run) {
    await run('Register normalizes email, hashes password, and hides password in response', async () => {
        let createdPayload = null;

        const repository = {
            async findByEmail() {
                return null;
            },
            async create(data) {
                createdPayload = data;
                return {
                    id: '11111111-1111-1111-1111-111111111111',
                    ...data,
                };
            },
        };

        const useCase = new Register(repository);
        const result = await useCase.execute({
            name: 'Alice',
            email: '  Alice@Example.COM  ',
            password: 'StrongPass1!',
        });

        assert.equal(result.id, '11111111-1111-1111-1111-111111111111');
        assert.equal(result.email, 'alice@example.com');
        assert.equal(Object.hasOwn(result, 'password'), false);
        assert.ok(createdPayload);
        assert.equal(createdPayload.email, 'alice@example.com');
        assert.notEqual(createdPayload.password, 'StrongPass1!');
        assert.equal(await comparePassword('StrongPass1!', createdPayload.password), true);
    });

    await run('Register rejects duplicate email', async () => {
        const repository = {
            async findByEmail(email) {
                return {
                    id: '11111111-1111-1111-1111-111111111111',
                    name: 'Alice',
                    email,
                    password: 'hashed',
                };
            },
            async create() {
                throw new Error('create should not be called');
            },
        };

        const useCase = new Register(repository);

        await assert.rejects(
            () =>
                useCase.execute({
                    name: 'Alice',
                    email: 'alice@example.com',
                    password: 'StrongPass1!',
                }),
            (error) => {
                assert.ok(error instanceof AppError);
                assert.equal(error.statusCode, 409);
                assert.equal(error.message, 'Email already in use');
                return true;
            }
        );
    });

    await run('Login normalizes email and returns a verifiable token', async () => {
        const hashedPassword = await hash('StrongPass1!');
        let lookedUpEmail = null;

        const repository = {
            async findByEmail(email) {
                lookedUpEmail = email;
                return {
                    id: '22222222-2222-4222-8222-222222222222',
                    name: 'Bob',
                    email,
                    password: hashedPassword,
                };
            },
        };

        const useCase = new Login(repository);
        const result = await useCase.execute('  Bob@Example.COM ', 'StrongPass1!');
        const payload = verifyToken(result.token);

        assert.equal(lookedUpEmail, 'bob@example.com');
        assert.equal(payload.id, '22222222-2222-4222-8222-222222222222');
    });

    await run('Login rejects invalid credentials', async () => {
        const repository = {
            async findByEmail() {
                return null;
            },
        };

        const useCase = new Login(repository);

        await assert.rejects(
            () => useCase.execute('nobody@example.com', 'wrong-password'),
            (error) => {
                assert.ok(error instanceof AppError);
                assert.equal(error.statusCode, 401);
                assert.equal(error.message, 'Invalid credentials');
                return true;
            }
        );
    });
};

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        setupFiles: ['tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/**'],
            exclude: ['src/db/migrations/**', 'src/@types/**'],
            thresholds: {
                statements: 60,
                branches: 50,
                functions: 60,
            },
        },
    },
});

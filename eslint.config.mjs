import tseslint from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            prettier,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...prettierConfig.rules,
            'prettier/prettier': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-console': ['warn', { allow: ['error'] }],
        },
    },
    {
        ignores: ['dist/', 'node_modules/', 'coverage/', 'src/db/migrations/'],
    },
]

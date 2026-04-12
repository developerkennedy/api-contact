# API Contact — Estado Atual

## Stack

- Runtime: Node.js + TypeScript
- Framework: Express 5
- Banco: PostgreSQL
- ORM: Drizzle ORM + postgres.js
- Validação: Zod
- Auth: JWT
- Logs: Pino

## Estrutura

```text
src/
├── @types/express.d.ts
├── auth/
│   ├── jwt.ts
│   ├── middleware.ts
│   ├── refresh-token.ts
│   └── schemas.ts
├── config/
│   ├── app.ts
│   ├── db.ts
│   └── env.ts
├── controllers/
│   ├── auth/
│   ├── category/
│   └── contact/
├── db/
│   ├── migrations/
│   ├── schema.ts
│   └── seed.ts
├── domain/
│   ├── category.entity.ts
│   ├── contact.entity.ts
│   ├── contact.schema.ts
│   ├── refresh-token.entity.ts
│   └── user.entity.ts
├── factories/
│   ├── auth.factory.ts
│   ├── category.factory.ts
│   └── contact.factory.ts
├── http/
│   ├── middlewares/
│   ├── routes/
│   └── server.ts
├── repositories/
│   ├── categories/
│   ├── contact/
│   ├── refresh-token/
│   └── user/
├── shared/
│   ├── errors/
│   ├── logger/
│   ├── types/
│   └── utils/
└── use-cases/
    ├── auth/
    ├── category/
    └── contact/
```

## Rotas

### Health

- `GET /health`

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout` (requer access token)

### Contacts

- `POST /api/v1/contacts`
- `GET /api/v1/contacts`
- `GET /api/v1/contacts/:id`
- `PATCH /api/v1/contacts/:id`
- `DELETE /api/v1/contacts/:id`

### Categories

- `POST /api/v1/categories`
- `GET /api/v1/categories`
- `GET /api/v1/categories/:id`
- `PATCH /api/v1/categories/:id`
- `DELETE /api/v1/categories/:id`

## Decisões Importantes

- Multi-tenant por `user_id` em contatos e categorias
- Soft delete em `users`, `contacts` e `categories`
- Índices únicos parciais para ignorar registros com `deleted_at`
- Índice em `category_id` na junction table `contacts_categories`
- Criação e atualização de contatos com categorias em transação
- Atualização de categorias em contatos usa diff (add/remove) ao invés de delete-all/re-insert
- Remoção de categoria limpa a tabela pivot `contacts_categories`
- Categorias deletadas não aparecem mais nas respostas de contatos
- JWT com `issuer`, `audience`, `subject` e algoritmo explícito
- Validação explícita do scheme `Bearer` no middleware de auth
- CORS wildcard bloqueado em produção (lança erro ao invés de apenas logar warning)
- Rate limiting por user ID (200/15min) em rotas autenticadas, além do global por IP (500/15min)
- Request ID sempre gerado server-side (não aceita header do cliente)
- Erros de validação Zod não expõem `formErrors` ao cliente
- Erros de constraint do Postgres não expõem nomes de constraint ao cliente
- Pool de conexões do Postgres configurado explicitamente (max 10, idle 30s, connect 10s)
- Controllers usam guard `if (!req.user)` ao invés de non-null assertion
- Shutdown gracioso encerra HTTP server e conexões do Postgres
- Refresh tokens opacos (UUID v4) armazenados como SHA-256 hash no banco
- Rotação de refresh token: cada uso invalida o anterior e emite novo par
- Detecção de roubo por família: reuso de token rotacionado invalida toda a família
- Access token com expiração de 15 minutos, refresh token de 7 dias (configurável)
- Limpeza oportunista de tokens expirados a cada refresh

## Variáveis de Ambiente

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `NODE_ENV`
- `CORS_ORIGIN`
- `TRUST_PROXY`
- `LOG_LEVEL`
- `JWT_REFRESH_EXPIRY_DAYS` (default: 7)

## Comandos

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm test` — Vitest (unit tests)
- `npm run test:coverage` — Vitest com cobertura (v8)
- `npm run test:legacy` — runner antigo em CJS (mantido por compatibilidade)
- `npm run db:generate`
- `npm run db:migrate`

## Qualidade Atual

- Build passando
- Lint passando
- Testes automatizados passando

## Testes Automatizados

Framework: Vitest (config em `vitest.config.ts`, setup em `tests/setup.ts`)

A suíte atual cobre (44 testes):

- **auth use-cases**: register (normalização, hash, duplicata) e login (access_token + refresh_token, credenciais inválidas)
- **refresh-token use-cases**: refresh (novo par, token desconhecido, roubo detectado, expirado, cleanup oportunista), logout (idempotente), utilitários (geração, hash determinístico, expiração)
- **contact use-cases**: create, update, delete, get, list e validações de schema
- **category use-cases**: create, update, delete, get, list e validações de schema
- **middlewares**: authenticate (sem header, scheme errado, token inválido, token válido) e errorHandler (AppError, ZodError, erro genérico)

Testes unitários usam mocks de repositórios tipados pelas interfaces.

## CI/CD

- GitHub Actions (`.github/workflows/ci.yml`) com 4 jobs paralelos: lint, build, security, test
- Job `test` roda com Postgres 16 e publica relatório de coverage como artefato
- Job `security` roda `npm audit --audit-level=high`
- Docker Compose de teste (`docker-compose.test.yml`) na porta 5433 com tmpfs

## Pendências Recomendadas

- Adicionar testes de integração HTTP (supertest)
- Cobrir repositórios com banco de teste
- Implementar `src/db/seed.ts`
- Criar documentação externa de uso da API (OpenAPI/Swagger)
- Implementar rate limiting específico para `/refresh` (separado do auth geral)

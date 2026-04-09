# API Contact — Guia do Projeto

## Instrução para o assistente

Sempre que um novo passo for concluído, atualize a seção **Progresso** deste arquivo marcando o passo como feito e adicionando novos passos descobertos durante o desenvolvimento.

---

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **ORM:** Drizzle ORM
- **Driver:** postgres.js
- **Banco (dev):** PostgreSQL via Docker
- **Validação:** Zod
- **Auth:** JWT
- **Env:** dotenv

---

## Arquitetura

```
src/
├── http/
│   ├── routes/contact.routes.ts
│   ├── middlewares/error-handler.ts
│   └── server.ts
├── auth/
│   ├── jwt.ts
│   ├── middleware.ts
│   └── schemas.ts
├── controllers/
│   └── contact.controller.ts
├── use-cases/
│   ├── create-contact.ts
│   ├── get-contact.ts
│   ├── list-contacts.ts
│   └── delete-contact.ts
├── repositories/
│   ├── interfaces/IContactRepository.ts
│   └── contact.repository.ts
├── domain/
│   ├── contact.entity.ts
│   └── contact.schema.ts
├── shared/
│   ├── errors/AppError.ts
│   ├── types/pagination.ts
│   └── utils/hash.ts
├── config/
│   ├── env.ts
│   ├── db.ts
│   └── app.ts
└── db/
    ├── migrations/
    ├── schema.ts
    └── seed.ts
```

---

## Progresso

### Configuração inicial

- [x] Estrutura de pastas e arquivos vazios criada
- [x] Dependências instaladas (`express`, `dotenv`, `zod`, `drizzle-orm`, `postgres`, `drizzle-kit`)
- [x] TypeScript configurado (`tsconfig.json`)
- [x] Scripts no `package.json` (`dev`, `build`, `start`, `db:generate`, `db:migrate`, `db:studio`)

### Config

- [x] `src/config/env.ts` — parse das variáveis de ambiente com Zod + `z.coerce.number()` para PORT
- [x] `src/config/app.ts` — criação do Express, middlewares globais (`json`, `urlencoded`)
- [x] `src/config/db.ts` — instância do Drizzle com postgres.js
- [x] `src/http/server.ts` — `app.listen` usando `env.PORT`

### Schema e banco

- [x] `src/domain/contact.schema.ts` — tabelas `users`, `contacts`, `categories`, `contacts_categories` (pivot)
- [x] Relacionamentos definidos: `users` → `contacts` (one-to-many), `contacts` ↔ `categories` (many-to-many)
- [x] Foreign keys com `onDelete: cascade`
- [x] `relations()` definidas para todas as tabelas
- [x] `src/db/schema.ts` — re-exporta tudo para o drizzle-kit
- [x] `drizzle.config.ts` — configuração do drizzle-kit (dialect, schema, out, dbCredentials)

### Próximos passos

- [x] Criar `.env` com `PORT`, `DATABASE_URL`, `JWT_SECRET`
- [x] Subir PostgreSQL com Docker
- [x] Gerar migrations (`npm run db:generate`)
- [x] Rodar migrations (`npm run db:migrate`)
- [x] `src/shared/errors/AppError.ts` — erro de domínio com statusCode
- [x] `src/http/middlewares/error-handler.ts` — middleware global de erros
- [x] `src/auth/` — JWT sign/verify, middleware de autenticação, schemas Zod
- [x] `src/repositories/` — interface e implementação com Drizzle
- [ ] `src/use-cases/` — regras de negócio
- [ ] `src/controllers/` — leitura de req e resposta
- [ ] `src/http/routes/contact.routes.ts` — registro das rotas

# Plano — API de Contatos

## Contexto

API RESTful de gerenciamento de contatos com autenticação JWT. Cada usuário tem seus próprios contatos (multi-tenancy por user_id). O projeto segue arquitetura em camadas com separação clara entre HTTP, regras de negócio, acesso a dados e domínio.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js + TypeScript (ES2020, CommonJS) |
| Framework | Express 5 |
| ORM | Drizzle ORM |
| Driver DB | postgres.js |
| Banco (dev) | PostgreSQL via Docker |
| Validação | Zod 4 |
| Autenticação | JWT (jsonwebtoken) |
| Env | dotenv |

---

## Arquitetura

```
src/
├── @types/express.d.ts         → augmenta req.user
├── auth/
│   ├── jwt.ts                  → signToken / verifyToken
│   ├── middleware.ts           → authenticate (extrai e valida JWT)
│   └── schemas.ts              → Zod: registerSchema, loginSchema
├── config/
│   ├── env.ts                  → parse de variáveis com Zod
│   ├── app.ts                  → Express + middlewares globais + error handler
│   └── db.ts                   → instância do Drizzle
├── domain/
│   ├── contact.entity.ts       → ContactDTO, CreateContactDto (Zod)
│   └── contact.schema.ts       → tabelas Drizzle + relations
├── db/
│   ├── schema.ts               → re-exporta para drizzle-kit
│   ├── migrations/             → arquivos gerados
│   └── seed.ts                 → (vazio — futuro)
├── shared/
│   ├── errors/AppError.ts      → erro de domínio com statusCode
│   ├── types/pagination.ts     → PaginationParams, PaginationResult
│   └── utils/hash.ts           → (vazio — futuro: bcrypt)
├── repositories/
│   ├── interfaces/IContactRepository.ts
│   └── contact.repository.ts
├── use-cases/
│   ├── create-contact.ts
│   ├── list-contacts.ts
│   ├── get-contact.ts
│   └── delete-contact.ts
├── controllers/
│   ├── create-contact.controller.ts
│   ├── list-contacts.controller.ts
│   ├── get-contact.controller.ts
│   └── delete-contact.controller.ts
└── http/
    ├── middlewares/error-handler.ts
    ├── routes/contact.routes.ts  → (vazio — próximo passo)
    └── server.ts
```

---

## Schema do banco

### `users`
| Coluna | Tipo | Restrições |
|---|---|---|
| id | UUID | PK, default random |
| name | varchar(255) | NOT NULL |
| email | varchar(255) | UNIQUE NOT NULL |
| password | varchar(255) | NOT NULL |
| created_at / updated_at / deleted_at | timestamp | — |

### `contacts`
| Coluna | Tipo | Restrições |
|---|---|---|
| id | UUID | PK, default random |
| name | varchar(255) | NOT NULL |
| email | varchar(255) | UNIQUE NOT NULL |
| user_id | UUID | FK → users (cascade delete) |
| created_at / updated_at / deleted_at | timestamp | — |

> Index em `user_id` para performance nas queries de listagem.

### `categories`
| Coluna | Tipo |
|---|---|
| id | UUID PK |
| name | varchar(255) NOT NULL |
| timestamps | — |

### `contacts_categories` (pivot many-to-many)
| Coluna | Tipo |
|---|---|
| contact_id | UUID FK → contacts (cascade) |
| category_id | UUID FK → categories (cascade) |
| PK composta | (contact_id, category_id) |

---

## Fluxo de uma requisição

```
Request
  → authenticate middleware (valida JWT → req.user)
  → Controller (lê req.body / req.params / req.query)
  → Use Case (regra de negócio, lança AppError se necessário)
  → Repository (acesso ao banco via Drizzle)
  → Response
       ↓ (em caso de erro)
  → error-handler middleware (trata AppError e erros genéricos)
```

---

## Endpoints planejados

### Contatos (todos protegidos por JWT)

| Método | Rota | Controller | Use Case |
|---|---|---|---|
| POST | /contacts | CreateContactController | CreateContact |
| GET | /contacts | ListContactsController | ListContacts |
| GET | /contacts/:id | GetContactController | GetContact |
| DELETE | /contacts/:id | DeleteContactController | DeleteContact |

### Query params para listagem
- `limit` (default: 10)
- `offset` (default: 0)

---

## Regras de negócio implementadas

### CreateContact
1. Normaliza email: `trim().toLowerCase()`
2. Verifica duplicidade por email + user_id → `409 Conflict`
3. Cria contato no banco

### ListContacts
- Lista contatos do usuário autenticado com paginação
- Retorna: `{ data, total, limit, offset }`

### GetContact
- Busca por id + user_id (escopo do usuário)
- Lança `404` se não encontrado

### DeleteContact
- Verifica existência → `404` se não encontrar
- Deleta o contato

---

## Padrões adotados

- **Injeção de dependência via construtor** em todos use-cases e controllers
- **Interface no repositório** (`IContactRepository`) — use-cases nunca dependem da implementação concreta
- **Escopo por user_id** em todas as queries — um usuário nunca acessa dados de outro
- **AppError** para erros de domínio com statusCode semântico
- **req.user!** (non-null assertion) nos controllers — garantido pelo middleware `authenticate`

---

## Estado atual

### Concluído
- [x] Config (env, app, db, server)
- [x] Schema do banco e migrations
- [x] Autenticação JWT (sign, verify, middleware)
- [x] Repositório com Drizzle (create, findAll, findById, findByEmail, delete)
- [x] Use-cases (create, list, get, delete)
- [x] Controllers separados por responsabilidade

### Próximos passos
- [x] `src/http/routes/contact.routes.ts` — registrar rotas com middleware + controllers
- [x] Instanciar dependências (repository → use-case → controller) no arquivo de rotas ou em um container
- [x] Registrar o router no `app.ts`
- [x] Implementar `src/shared/utils/hash.ts` — bcrypt para senhas (necessário para auth de usuários)
- [x] Implementar rotas de autenticação (`/auth/register`, `/auth/login`)
- [ ] `src/db/seed.ts` — dados iniciais para desenvolvimento

---

## Como pensar essa API do zero

1. **Defina o domínio** — quais entidades existem e como se relacionam (users, contacts, categories)
2. **Modele o banco** — schema com Drizzle, relações, índices para performance
3. **Defina contratos** — DTOs com Zod, interfaces de repositório
4. **Implemente o acesso a dados** — repositório concreto com Drizzle
5. **Escreva as regras de negócio** — use-cases que dependem apenas da interface do repositório
6. **Conecte ao HTTP** — controllers finos que só leem req e escrevem res
7. **Registre as rotas** — aplique middlewares (auth) e conecte controllers
8. **Trate erros globalmente** — error-handler centralizado

Essa ordem garante que cada camada pode ser desenvolvida e testada independentemente.

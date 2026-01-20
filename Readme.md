
# create-backend-setup

Interactive CLI to scaffold a production-ready backend project.

---

## Quick Start

```bash
npx create-backend-setup
````

Or using npm init:

```bash
npm init backend-setup
```

No global installation required.

---

## What it does

`create-backend-setup` generates a backend project based on your choices, including:

* Express.js setup
* Optional CORS configuration
* TypeScript support
* Database setup

  * PostgreSQL with Prisma
  * MongoDB
* Zod-based request validation
* Clean, scalable folder structure

---

## Prompts

During setup, you will be asked:

* Project name
* Whether to use Express
* Whether to enable CORS
* Whether to use TypeScript
* Database choice (Prisma / MongoDB)
* Whether to include Zod

---

## Generated Structure (example)

```txt
my-backend-app/
├─ src/
│  ├─ config/
│  ├─ controllers/
│  ├─ middlewares/
│  ├─ models/
│  ├─ routes/
│  ├─ validators/
│  └─ index.ts
├─ prisma/
│  └─ schema.prisma
├─ prisma.config.ts
├─ .env
├─ package.json
└─ tsconfig.json
```

---
## Keywords

create-backend-setup, backend-setup, create-backend, backend-generator, backend-cli, backend-scaffold, node-backend, express-backend, api-backend, typescript-backend, prisma-backend, postgres-backend, mongodb-backend, cli-tool, npx, nodejs, express, typescript, prisma, postgresql, mongodb, zod

---

## Prisma Notes

This project uses **Prisma v7+**.

* Database URLs are configured in `prisma.config.ts`
* `schema.prisma` does not contain connection strings
* Runtime connection is handled via `PrismaClient`

---

## After setup

```bash
cd my-backend-app
npm run dev
```

For Prisma migrations:

```bash
npx prisma migrate dev
```

---

## Requirements

* Node.js >= 18
* npm >= 9


---

## Why this looks more like a “real npm package”

✅ Command-first (`npx` at the top)  
✅ Minimal emojis (npm prefers clean docs)  
✅ Short sections  
✅ No marketing language  
✅ Similar structure to popular CLIs  

---

## Final step (important)

After updating README:

```bash
npm version patch
npm publish
````

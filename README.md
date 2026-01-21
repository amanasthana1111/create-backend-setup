# create-backend-setup

Interactive CLI to scaffold a production-ready backend project with a clean, scalable structure.

---

## 🚀 Quick Start

Using **npx** (recommended):

```bash
npx create-backend-setup@latest
```

Or using **npm init**:

```bash
npm init backend-setup@latest
```

No global installation required.

---

## 📦 What it does

`create-backend-setup` generates a backend project based on your choices, including:

- Express.js setup
- Optional CORS configuration
- TypeScript support
- Authentication utilities
  - bcrypt
  - jsonwebtoken (JWT)
- Database setup
  - PostgreSQL with Prisma
  - MongoDB with Mongoose
- Zod-based request validation
- Environment variable configuration
- Clean, scalable folder structure

---

## 🧩 Prompts

During setup, you will be asked:

- Project name
- Whether to use Express
- Whether to enable CORS
- Whether to use TypeScript
- Database choice (PostgreSQL with Prisma / MongoDB with Mongoose)
- Whether to include Zod
- Whether to include bcrypt
- Whether to include jsonwebtoken

---

## 📁 Generated Structure (example)

```
my-backend-app/
├─ src/
│  ├─ config/
│  │  └─ db.ts
│  ├─ controllers/
│  ├─ middlewares/
│  │  └─ Auth.ts
│  ├─ models/
│  ├─ routes/
│  ├─ validators/
│  └─ index.ts
├─ prisma/
│  └─ schema.prisma
├─ .env
├─ package.json
└─ tsconfig.json
```

---

## 🔐 Authentication

If selected, the project includes:

- `bcrypt` for password hashing
- `jsonwebtoken` for JWT-based authentication
- A ready-to-use `Auth` middleware for protected routes

Example usage:

```ts
import { UserAuth } from "./middlewares/Auth.js";

app.get("/protected", UserAuth, (req, res) => {
  res.json({ success: true });
});
```

---

## 🌱 Environment Variables

A `.env` file is generated automatically.

Example:

```env
PORT=3000
DATABASE_URL=
MONGO_URI=
JWT_PASS=your-secret-key
```

---

## 🗄 Database Notes

### Prisma (PostgreSQL)

- Uses **Prisma v7+**
- Connection string is stored in environment variables
- `schema.prisma` does not contain secrets
- Prisma Client is initialized in `src/config/db.ts`

Run migrations:

```bash
npx prisma migrate dev
```

### MongoDB (Mongoose)

- Uses `mongoose`
- Connection handled via `connectDB`
- URI stored in `MONGO_URI`

---

## ▶️ Scripts

Common npm scripts included:

```bash
npm run dev      # build and start server
npm run build    # compile TypeScript
npm start        # run compiled output
```

Additional Prisma scripts (if selected):

```bash
npm run prisma:generate
npm run prisma:migrate
```

---

## ▶️ After setup

```bash
cd my-backend-app
npm run dev
```

Server will start on the port defined in `.env`.

---

## 📋 Requirements

- Node.js >= 18
- npm >= 9

---

## 🤝 Contributing

Pull requests are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## 📄 License

MIC

---



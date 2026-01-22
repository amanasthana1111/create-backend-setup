#!/usr/bin/env node

import inquirer from "inquirer";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";

type PromptAnswers = {
  projectName: string;
};

const writeIfNotExists = async (filePath: string, content: string) => {
  if (!(await fs.pathExists(filePath))) {
    await fs.writeFile(filePath, content);
  }
};

async function run() {
  const cwd = process.cwd();

  /* -------- PROJECT NAME -------- */
  const { projectName } = await inquirer.prompt<PromptAnswers>([
    {
      type: "input",
      name: "projectName",
      message: "Enter your project name (use . for current folder):",
      default: "my-backend-app",
    },
  ]);

  const projectPath = projectName === "." ? cwd : path.join(cwd, projectName);

  if (projectName !== ".") {
    await fs.ensureDir(projectPath);
  }

  if ((await fs.readdir(projectPath)).length > 0) {
    const { proceed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceed",
        message: "Directory is not empty. Continue?",
        default: false,
      },
    ]);
    if (!proceed) process.exit(0);
  }

  process.chdir(projectPath);
  console.log(`📁 Creating project in ${process.cwd()}`);

  /* -------- TECH STACK -------- */
  const answers = await inquirer.prompt([
    {
      type: "confirm",
      name: "express",
      message: "Do you want to use Express?",
      default: true,
    },
    {
      type: "confirm",
      name: "cors",
      message: "Do you want to use CORS?",
      default: true,
    },
    {
      type: "confirm",
      name: "typescript",
      message: "Do you want to use TypeScript?",
      default: true,
    },
    {
      type: "list",
      name: "database",
      message: "Choose database ORM [Prisma ,MongoDB]",
      choices: ["PostgreSQL (Prisma)", "MongoDB (Mongoose)"],
      default: "PostgreSQL (Prisma)",
    },
    {
      type: "confirm",
      name: "zod",
      message: "Do you want to use Zod?",
      default: true,
    },
    {
      type: "confirm",
      name: "bcrypt",
      message: "Do you want to use bcrypt?",
      default: true,
    },
    {
      type: "confirm",
      name: "jsonwebtoken",
      message: "Do you want to use jsonwebtoken?",
      default: true,
    },
  ]);

  /* -------- FOLDERS -------- */
  const dirs = [
    "src",
    "src/controllers",
    "src/routes",
    "src/models",
    "src/middlewares",
    "src/validators",
    "src/config",
  ];

  for (const dir of dirs) {
    await fs.ensureDir(dir);
  }
  console.log("Files are Created");

  /* -------- FILES -------- */

  if (answers.express || answers.typescript) {
    await writeIfNotExists(
      "src/index.ts",
      `
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import {connectDB} from "./config/db.js" FOR M-DB
// import { prismaDB } from "./config/db.js"; FOR P-DB

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

const main = async () => {
  // await connectDB();
  app.listen(PORT, () => {
    console.log(\`🚀 Server running on port \${PORT}\`);
  });
};

main();
`.trim(),
    );
  }

  if (answers.express) {
    await writeIfNotExists(
      "src/controllers/Status.ts",
      `
import type { Request, Response } from "express";

const Status = async (req: Request, res: Response) => {
  res.json({
    sucess: true,
    mess: "Server is fine",
  });
};

export { Status };
`.trim(),
    );

    await writeIfNotExists(
      "src/routes/index.ts",
      `
import { Router } from "express";
import { Status } from "../controllers/Status.js";

const router = Router();

router.get("/health", Status);

export default router;
`.trim(),
    );
  }
  if (answers.jsonwebtoken) {
    await writeIfNotExists(
      "src/middlewares/Auth.ts",
      `
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export const UserAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token: string | undefined = req.cookies?.token;
    if (!process.env.JWT_PASS) {
  throw new Error("JWT_PASS is missing");
}
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_PASS);
      if (!decoded || typeof decoded !== "object" || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    // @ts-ignore
    req.userId = decoded.userId;
    
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

`.trim(),
    );
  }
  await writeIfNotExists(
    ".env",
    `PORT=3000\nDATABASE_URL=\nMONGO_URI=\nJWT_PASS="my-jwt-pass"\n`,
  );

  await writeIfNotExists(
    "tsconfig.json",
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          rootDir: "./src",
          outDir: "./dist",
          strict: true,
          esModuleInterop: true,
          forceConsistentCasingInFileNames: true,
          skipLibCheck: true,
        },
        include: ["src/**/*.ts"],
      },
      null,
      2,
    ),
  );

  /* -------- DEPENDENCIES -------- */
  const deps = ["cookie-parser", "dotenv"];
  const devDeps: string[] = [];

  if (answers.express) deps.push("express");
  if (answers.cors) deps.push("cors");
  if (answers.zod) deps.push("zod");
  if (answers.bcrypt) deps.push("bcrypt");
  if (answers.jsonwebtoken) deps.push("jsonwebtoken");

  if (answers.database.includes("MongoDB")) {
    deps.push("mongoose");
  }

  if (answers.database.includes("Prisma")) {
    deps.push("@prisma/client");
    devDeps.push("prisma");
  }

  if (answers.typescript) {
    devDeps.push(
      "typescript",
      "ts-node-dev",
      "@types/node",
      "@types/express",
      "@types/cors",
      "@types/cookie-parser",
      "@types/bcrypt",
      "@types/jsonwebtoken",
    );
  }

  await execa("npm", ["init", "-y"], { stdio: "inherit" });
  await execa("npm", ["install", ...deps], { stdio: "inherit" });

  if (devDeps.length) {
    await execa("npm", ["install", "-D", ...devDeps], { stdio: "inherit" });
  }

  /* -------- PACKAGE.JSON SETUP -------- */
  const pkgPath = "package.json";
  const pkg = await fs.readJSON(pkgPath);

  pkg.name = projectName === "." ? "backend-app" : projectName;
  pkg.type = "module";

  pkg.scripts = {
    dev: "tsc -b && node ./dist/index.js",
    build: "tsc",
    start: "node dist/index.js",
    ...(answers.database.includes("Prisma") && {
      "prisma:generate": "prisma generate",
      "prisma:migrate": "prisma migrate dev",
    }),
  };

  await fs.writeJSON(pkgPath, pkg, { spaces: 2 });

  console.log("📦 package.json configured");

  /* -------- DATABASE -------- */
  if (answers.database.includes("Prisma")) {
    await execa("npx", ["prisma", "init"], { stdio: "inherit" });

    await writeIfNotExists(
      "src/config/db.ts",
      `
import { PrismaClient } from "@prisma/client";
export const prismaDB = new PrismaClient();
`.trim(),
    );
    await writeIfNotExists(
      "prisma/schema.prisma",
      `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
//   model User {
//   id        Int      @id @default(autoincrement())
//   username  String   @unique
//   name      String
//   email     String   @unique
//   password  String

//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

`.trim(),
    );
  } else {
    await writeIfNotExists(
      "src/config/db.ts",
      `
import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("MongoDB connected");
};
`.trim(),
    );
    await writeIfNotExists(
      "src/models/UserSchema",
      `
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  password: string;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);

`.trim(),
    );


  }

  /* -------- ZOD -------- */
  if (answers.zod) {
    await writeIfNotExists(
      "src/validators/example.schema.ts",
      `
import { z } from "zod";

export const exampleSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});
`.trim(),
    );
  }

  console.log("✅ Backend project generated successfully");
}

run();

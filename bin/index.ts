#!/usr/bin/env node

import inquirer from "inquirer";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";


type PromptAnswers = {
  projectName: string;
};
async function run() {
  const cwd = process.cwd();

  /* -------- PROJECT NAME -------- */
  const { projectName }= await inquirer.prompt<PromptAnswers>([
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
      message: "Do you want to use  Express?",
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

  /* -------- FILES -------- */
  await fs.writeFile(
    "src/index.ts",
    `
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
// import {connectDB} from "./config/db.js" FOR M-DB
//import { prismaDB } from "./config/db.js"; FOR P-DB


dotenv.config();

const app = express();


app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;


const main = async()=>{
    // await connectDB(); if u use monodb . if not remove that line
    app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
    }
main();


`.trim(),
  );

  await fs.writeFile(
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

  await fs.writeFile(
    "src/routes/index.ts",
    `
import { Router } from "express";
import {Status} from "../controllers/Status.js"

const router = Router();

router.get("/health", Status);

export default router;
`.trim(),
  );

  await fs.writeFile(".env", `PORT=3000\nDATABASE_URL=\nMONGO_URI=\n`);

  await fs.writeFile(
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
  const devDeps = [];

  if (answers.express) deps.push("express");
  if (answers.cors) deps.push("cors");
  if (answers.zod) deps.push("zod");
  console.log("DB ANSWER:", answers.database);

  if (answers.database.includes("MongoDB (Mongoose)")) {
    deps.push("mongoose");
  }

  if (answers.database.includes("PostgreSQL (Prisma)")) {
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
    );
  }

  await execa("npm", ["init", "-y"], { stdio: "inherit" });
  await execa("npm", ["install", ...deps], { stdio: "inherit" });
  if (devDeps.length)
    await execa("npm", ["install", "-D", ...devDeps], { stdio: "inherit" });
  // ---------------- PACKAGE.JSON SETUP ----------------

  const pkgPath = "package.json";

  // read existing package.json
  const pkg = await fs.readJSON(pkgPath);

  // set package name from project name (important for npm scripts)
  pkg.name = projectName === "." ? "backend-app" : projectName;

  // ESM support
  pkg.type = "module";

  // scripts
  pkg.scripts = {
    dev: "tsc -b && node ./dist/index.js",
    build: "tsc",
    start: "node dist/index.js",
    ...(answers.database.includes("Prisma") && {
      "prisma:generate": "prisma generate",
      "prisma:migrate": "prisma migrate dev",
    }),
  };

  // write back
  await fs.writeJSON(pkgPath, pkg, { spaces: 2 });

  console.log("📦 package.json configured");

  /* -------- DATABASE -------- */
  if (answers.database.includes("Prisma")) {
    await execa("npx", ["prisma", "init"], { stdio: "inherit" });

    await fs.writeFile(
      "src/config/db.ts",
      `
import { PrismaClient } from "@prisma/client";
export const prismaDB = new PrismaClient();
`.trim(),
    );
  } else {
    await fs.writeFile(
      "src/config/db.ts",
      `
import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("MongoDB connected");
};
`.trim(),
    );
  }

  /* ---------------- ZOD ---------------- */

  if (answers.zod) {
    await fs.writeFile(
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

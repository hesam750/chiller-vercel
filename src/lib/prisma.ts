import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const defaultUrl =
  process.env.VERCEL && process.env.VERCEL !== "0"
    ? "file:/tmp/dev.db"
    : "file:./dev.db";
const connectionString = process.env.DATABASE_URL || defaultUrl;

if (defaultUrl.startsWith("file:/tmp/")) {
  const tmpPath = "/tmp/dev.db";
  try {
    if (!fs.existsSync(tmpPath)) {
      const src = path.join(process.cwd(), "dev.db");
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, tmpPath);
      } else {
        fs.writeFileSync(tmpPath, "", "utf8");
      }
    }
  } catch {
  }
}
const adapter = new PrismaBetterSqlite3({
  url: connectionString,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

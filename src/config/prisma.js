import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "./databaseUrl.js";

const globalForPrisma = globalThis;
const databaseUrl = getDatabaseUrl();

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    ...(databaseUrl
      ? {
          datasources: {
            db: { url: databaseUrl },
          },
        }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

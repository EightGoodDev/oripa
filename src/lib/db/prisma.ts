import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

function parsePoolMax() {
  const fromEnv = Number(process.env.PG_POOL_MAX ?? "");
  if (Number.isFinite(fromEnv) && fromEnv > 0) return Math.floor(fromEnv);
  return process.env.NODE_ENV === "production" ? 1 : 5;
}

const connectionString = (
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  ""
).trim();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  if (!connectionString) {
    throw new Error("DATABASE_URL or DIRECT_URL must be set");
  }

  const pool = new pg.Pool({
    connectionString,
    max: parsePoolMax(),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

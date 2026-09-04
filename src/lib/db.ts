import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Serverless (Vercel) opens many short-lived workers. Cap each client to 1
 * connection so we don't exhaust Neon/Vercel Postgres quotas.
 * Also prefer DATABASE_URL = pooled URL, not the migration/direct role.
 */
function datasourceUrl(): string | undefined {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "10");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: { url: datasourceUrl() },
    },
  });

// Reuse one client per worker (dev, build, and production) to avoid connection exhaustion.
globalForPrisma.prisma = db;

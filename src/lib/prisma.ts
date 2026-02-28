import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const disableCacheEnv = ["1", "true"].includes(
  (process.env.DISABLE_SUPABASE_CACHE ?? "").toLowerCase(),
);

let prismaAvailable = !disableCacheEnv;
let hasLoggedPrismaWarning = false;
let nextPrismaRetryAt = 0;

const PRISMA_RETRY_BACKOFF_MS = Number(process.env.SUPABASE_RETRY_BACKOFF_MS ?? 5 * 60 * 1000);

function logCacheWarning(message: string) {
  if (hasLoggedPrismaWarning || process.env.NODE_ENV !== "development") {
    return;
  }
  hasLoggedPrismaWarning = true;
  console.warn(`[cache] ${message}`);
}

function shouldSwallowPrismaError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { code?: string; name?: string; message?: string };
  const message = maybeError.message ?? "";
  const isConnectivityError =
    maybeError.code === "P1001" ||
    maybeError.name === "PrismaClientInitializationError" ||
    message.includes("Can't reach database server") ||
    message.includes("connect") ||
    message.includes("ECONN");

  if (isConnectivityError) {
    logCacheWarning(
      `Deshabilitando cache de Supabase por error de conexión${message ? `: ${message}` : ""}`,
    );
    prismaAvailable = false;
    nextPrismaRetryAt = Date.now() + PRISMA_RETRY_BACKOFF_MS;
    return true;
  }

  return false;
}

export function isPrismaAvailable() {
  return prismaAvailable;
}

export async function runPrisma<T>(action: (client: PrismaClient) => Promise<T>): Promise<T | null> {
  if (!prismaAvailable) {
    if (Date.now() >= nextPrismaRetryAt) {
      prismaAvailable = true;
    } else {
      return null;
    }
  }

  if (!prismaAvailable) {
    return null;
  }

  try {
    return await action(prisma);
  } catch (error) {
    if (shouldSwallowPrismaError(error)) {
      return null;
    }
    throw error;
  }
}

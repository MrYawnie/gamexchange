import { PrismaClient } from "@prisma/client/edge";

declare global {
  var prisma: PrismaClient | undefined;
}

const config = process.env.DATABASE_URL;

export const db = new PrismaClient({
  datasources: {
    db: {
      url: config,
    },
  },
});

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Force PostgreSQL connection for production
const getDatabaseUrl = () => {
  // Make sure we're using PostgreSQL in production
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    // Ensure the DATABASE_URL is for PostgreSQL
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.includes('postgresql://')) {
      console.warn('DATABASE_URL does not appear to be a PostgreSQL connection string');
    }
    return { url: process.env.DATABASE_URL };
  }
  
  // For development, use whatever is in schema.prisma
  return {};
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: getDatabaseUrl(),
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
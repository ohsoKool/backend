import { PrismaClient } from "@prisma/client";

let db;

try {
  console.log('Initializing Prisma client...');
  db = new PrismaClient();
  console.log('Prisma client initialized successfully');
} catch (error) {
  console.error('Error initializing Prisma client:', {
    name: error.name,
    message: error.message,
    stack: error.stack
  });
  throw error;
}

export { db };

import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { prisma } from './lib/prisma';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connection before binding to port
    await prisma.$connect();
    console.log('📦 Connected to PostgreSQL database');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Kanban API Server running at http://localhost:${PORT}`);
      console.log(`🏥 Health check ready at http://localhost:${PORT}/api/health`);
    });

    // Graceful Shutdown handling
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('🔒 Database connections closed. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();

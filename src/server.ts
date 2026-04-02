// src/server.ts

import app from "./app";
import config from "./config/env";
import { prisma } from "./lib/prisma";

const PORT = config.port;
const NODE_ENV = config.nodeEnv;

/**
 * Verify database connection before starting the server
 */
const verifyDatabaseConnection = async (): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    console.log();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// start server function
const startServer = async (): Promise<void> => {
  try {
    // 🔹 Verify database connection
    await verifyDatabaseConnection();

    // 🔹 Start Express server
    const server = app.listen(PORT, () => {
      console.log(`

          🚀 Finance Dashboard API Running   

          Environment: ${NODE_ENV.toUpperCase()}
          Port: ${PORT.toString()}
          API Docs: http://localhost:${PORT}/api-docs
          Health Check: http://localhost:${PORT}

      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

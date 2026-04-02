// src/server.ts

import app from "./app";
import config from "./config/env";
import { prisma } from "./lib/prisma";

const PORT = config.port;
const NODE_ENV = config.nodeEnv;

const logEnvironmentVariables = (): void => {
  const envSnapshot = {
    PORT: process.env.PORT ?? String(PORT),
    NODE_ENV,
    PROD_URL: config.prodUrl,
    DATABASE_URL: process.env.DATABASE_URL ? "[redacted]" : "[not set]",
    JWT_SECRET: process.env.JWT_SECRET ? "[redacted]" : "[not set]",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  };

  console.log("Environment variables:");
  for (const [key, value] of Object.entries(envSnapshot)) {
    console.log(`${key}: ${value}`);
  }
};

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
    logEnvironmentVariables();

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

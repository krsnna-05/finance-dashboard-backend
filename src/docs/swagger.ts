import swaggerJsdoc from "swagger-jsdoc";
import { Options } from "swagger-jsdoc";
import config from "../config/env";

const serverUrl =
  config.nodeEnv === "prod"
    ? config.prodUrl.replace(/\/$/, "")
    : `http://localhost:${config.port}`;

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Dashboard API",
      version: "1.0.0",
      description: "Backend API for Finance Dashboard 🚀",
    },
    servers: [
      {
        url: serverUrl,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/modules/**/*.ts"], // 🔥 important
};

export const swaggerSpec = swaggerJsdoc(options);

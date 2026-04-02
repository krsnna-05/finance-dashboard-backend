import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: "dev" | "prod";
  prodUrl: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: (process.env.NODE_ENV || "dev") as "dev" | "prod",
  prodUrl: process.env.PROD_URL || "http://localhost:3000",
};

export default config;

import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: "dev" | "prod";
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: (process.env.NODE_ENV || "dev") as "dev" | "prod",
};

export default config;

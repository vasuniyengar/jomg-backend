import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const parsedDatabaseUrl = process.env.DATABASE_URL
  ? new URL(process.env.DATABASE_URL)
  : null;
const fallbackDialect = parsedDatabaseUrl?.protocol?.replace(":", "") || "mysql";
const fallbackPort = parsedDatabaseUrl?.port
  ? Number(parsedDatabaseUrl.port)
  : fallbackDialect === "postgresql"
    ? 5432
    : 3306;
const resolvedDialect =
  process.env.DB_DIALECT || (fallbackDialect === "postgresql" ? "postgres" : fallbackDialect);
const resolvedHost = process.env.DB_HOST || parsedDatabaseUrl?.hostname || "localhost";
const resolvedPort = Number(process.env.DB_PORT || fallbackPort);
const resolvedDatabase =
  process.env.DB_NAME || parsedDatabaseUrl?.pathname?.replace(/^\//, "");
const resolvedUser = process.env.DB_USER || parsedDatabaseUrl?.username;
const resolvedPassword = process.env.DB_PASSWORD || parsedDatabaseUrl?.password;

const sequelize = new Sequelize(
  resolvedDatabase,
  resolvedUser,
  resolvedPassword,
  {
    host: resolvedHost,
    port: resolvedPort,
    dialect: resolvedDialect,
    logging: false,
    dialectOptions:
      resolvedDialect === "postgres" && process.env.DB_SSL === "true"
        ? {
            ssl: { require: true, rejectUnauthorized: false },
          }
        : {},
  }
);

export default sequelize;

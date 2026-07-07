import "dotenv/config";
import { Sequelize } from "sequelize";

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
const rawSslMode = parsedDatabaseUrl?.searchParams?.get("sslmode");
const postgresSslEnabled =
  resolvedDialect === "postgres" &&
  (process.env.DB_SSL === "true" ||
    process.env.NODE_ENV === "production" ||
    Boolean(rawSslMode && rawSslMode !== "disable"));

function buildSequelizeOptions() {
  const baseOptions = {
    logging: false,
  };

  if (resolvedDialect !== "postgres") {
    return {
      ...baseOptions,
      host: resolvedHost,
      port: resolvedPort,
      dialect: resolvedDialect,
    };
  }

  return {
    ...baseOptions,
    dialect: resolvedDialect,
    dialectOptions: postgresSslEnabled
      ? {
          ssl: { require: true, rejectUnauthorized: false },
        }
      : {},
  };
}

export function getDatabaseConnectionInfo() {
  return {
    dialect: resolvedDialect,
    host: resolvedHost,
    port: resolvedPort,
    database: resolvedDatabase,
    sslEnabled: postgresSslEnabled,
    source: process.env.DATABASE_URL ? "DATABASE_URL" : "DB_*",
  };
}

const sequelizeOptions = buildSequelizeOptions();

const sequelize =
  resolvedDialect === "postgres" && process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, sequelizeOptions)
    : new Sequelize(
        resolvedDatabase,
        resolvedUser,
        resolvedPassword,
        {
          ...sequelizeOptions,
          host: resolvedHost,
          port: resolvedPort,
        }
      );

export default sequelize;

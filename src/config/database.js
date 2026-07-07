import "dotenv/config";
import { Sequelize } from "sequelize";
import { getDatabaseUrl, getDatabaseUrlParts } from "./databaseUrl.js";

const databaseUrl = getDatabaseUrl();
const urlParts = getDatabaseUrlParts();

const parsedDatabaseUrl = databaseUrl ? new URL(databaseUrl) : null;
const fallbackDialect = parsedDatabaseUrl?.protocol?.replace(":", "") || "mysql";
const fallbackPort = parsedDatabaseUrl?.port
  ? Number(parsedDatabaseUrl.port)
  : fallbackDialect === "postgresql"
    ? 5432
    : 3306;
const resolvedDialect =
  process.env.DB_DIALECT || (fallbackDialect === "postgresql" ? "postgres" : fallbackDialect);
const resolvedHost =
  process.env.DB_HOST || urlParts?.host || parsedDatabaseUrl?.hostname || "localhost";
const resolvedPort = Number(process.env.DB_PORT || urlParts?.port || fallbackPort);
const resolvedDatabase =
  process.env.DB_NAME || urlParts?.database || parsedDatabaseUrl?.pathname?.replace(/^\//, "");
const resolvedUser =
  process.env.DB_USER || urlParts?.user || parsedDatabaseUrl?.username;
const resolvedPassword =
  process.env.DB_PASSWORD || parsedDatabaseUrl?.password;
const rawSslMode = parsedDatabaseUrl?.searchParams?.get("sslmode");
const postgresSslEnabled =
  resolvedDialect === "postgres" &&
  (process.env.DB_SSL === "true" ||
    process.env.NODE_ENV === "production" ||
    resolvedHost.includes(".rds.amazonaws.com") ||
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
    source: databaseUrl || process.env.DATABASE_URL ? "DATABASE_URL" : "DB_*",
  };
}

const sequelizeOptions = buildSequelizeOptions();

const sequelize =
  resolvedDialect === "postgres" && databaseUrl
    ? new Sequelize(databaseUrl, sequelizeOptions)
    : new Sequelize(resolvedDatabase, resolvedUser, resolvedPassword, {
        ...sequelizeOptions,
        host: resolvedHost,
        port: resolvedPort,
      });

export default sequelize;

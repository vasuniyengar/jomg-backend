import process from "node:process";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const REQUIRED_TABLE_ORDER = [
  "roles",
  "formats",
  "groups",
  "users",
  "userroles",
  "clubs",
  "events",
  "scoringlists",
  "playoffseedings",
  "bracketformats",
  "tournaments",
  "brackets",
  "teams",
  "teamplayers",
  "playerregistrations",
  "Pool",
  "PoolTeam",
  "rounds",
  "Matches",
  "poolteamstats",
  "playerbrackets",
];

const TABLE_TO_PRISMA_MODEL = {
  roles: "role",
  formats: "format",
  groups: "group",
  users: "user",
  userroles: "userRole",
  clubs: "club",
  events: "event",
  scoringlists: "scoringList",
  playoffseedings: "playoffSeeding",
  bracketformats: "bracketFormat",
  tournaments: "tournament",
  brackets: "bracket",
  teams: "team",
  teamplayers: "teamPlayer",
  playerregistrations: "playerRegistration",
  Pool: "pool",
  PoolTeam: "poolTeam",
  rounds: "round",
  Matches: "match",
  poolteamstats: "poolTeamStats",
  playerbrackets: "playerBracket",
};

function getArg(name) {
  const value = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return value ? value.split("=")[1] : undefined;
}

const DRY_RUN = process.argv.includes("--dry-run");
const BATCH_SIZE = Number(getArg("--batch-size") || 500);

async function mysqlConnection() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_MIGRATION_HOST || process.env.DB_HOST || "localhost",
    port: Number(process.env.MYSQL_MIGRATION_PORT || 3306),
    user: process.env.MYSQL_MIGRATION_USER || process.env.DB_USER,
    password: process.env.MYSQL_MIGRATION_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQL_MIGRATION_DB || process.env.DB_NAME,
    charset: "utf8mb4",
  });

  return connection;
}

async function fetchCount(connection, tableName) {
  const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM \`${tableName}\``);
  return Number(rows[0].count || 0);
}

async function fetchBatch(connection, tableName, offset) {
  const [rows] = await connection.query(
    `SELECT * FROM \`${tableName}\` LIMIT ${BATCH_SIZE} OFFSET ${offset}`
  );
  return rows;
}

function normalizeRow(tableName, row) {
  if (tableName === "PoolTeam") {
    return {
      poolId: row.poolId,
      teamId: row.teamId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
  return row;
}

async function insertRows(modelName, tableName, rows) {
  if (rows.length === 0) {
    return { inserted: 0, failed: 0 };
  }

  if (DRY_RUN) {
    return { inserted: rows.length, failed: 0 };
  }

  try {
    if (tableName === "PoolTeam") {
      await prisma[modelName].createMany({
        data: rows.map((row) => normalizeRow(tableName, row)),
        skipDuplicates: true,
      });
    } else {
      await prisma[modelName].createMany({
        data: rows,
        skipDuplicates: true,
      });
    }
    return { inserted: rows.length, failed: 0 };
  } catch (error) {
    console.error(`[Migration] Batch insert failed for ${tableName}:`, error.message);
    return { inserted: 0, failed: rows.length };
  }
}

async function verifyCounts(connection, summary) {
  const verification = [];

  for (const item of summary) {
    const mysqlCount = await fetchCount(connection, item.table);
    let postgresCount = 0;
    if (!DRY_RUN) {
      postgresCount = await prisma[item.model].count();
    }

    verification.push({
      table: item.table,
      mysqlCount,
      postgresCount: DRY_RUN ? "dry-run" : postgresCount,
      imported: item.imported,
      failed: item.failed,
    });
  }

  return verification;
}

async function main() {
  const connection = await mysqlConnection();
  const summary = [];

  console.log(
    `[Migration] Starting MySQL -> PostgreSQL migration (dryRun=${DRY_RUN}, batchSize=${BATCH_SIZE})`
  );

  try {
    for (const tableName of REQUIRED_TABLE_ORDER) {
      const modelName = TABLE_TO_PRISMA_MODEL[tableName];
      if (!modelName || !prisma[modelName]) {
        console.log(`[Migration] Skipping unmapped table: ${tableName}`);
        continue;
      }

      const total = await fetchCount(connection, tableName);
      let offset = 0;
      let imported = 0;
      let failed = 0;

      console.log(`[Migration] Processing ${tableName} (${total} rows)`);

      while (offset < total) {
        const rows = await fetchBatch(connection, tableName, offset);
        const result = await insertRows(modelName, tableName, rows);
        imported += result.inserted;
        failed += result.failed;
        offset += rows.length;

        if (rows.length === 0) {
          break;
        }
      }

      summary.push({ table: tableName, model: modelName, imported, failed });
    }

    const verification = await verifyCounts(connection, summary);

    console.table(summary);
    console.table(verification);

    const hasFailures = summary.some((item) => item.failed > 0);
    if (hasFailures) {
      process.exitCode = 1;
      console.error("[Migration] Completed with failed rows. Review logs before retry.");
    } else {
      console.log("[Migration] Completed successfully.");
    }
  } finally {
    await connection.end();
    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error("[Migration] Fatal error", error);
  await prisma.$disconnect();
  process.exit(1);
});

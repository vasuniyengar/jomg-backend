function parseDatabaseUrl(raw) {
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

function isPostgresUrl(url) {
  return url?.protocol === "postgresql:" || url?.protocol === "postgres:";
}

function shouldUsePostgresSsl(url) {
  const sslMode = url.searchParams.get("sslmode");
  return (
    process.env.DB_SSL === "true" ||
    process.env.NODE_ENV === "production" ||
    url.hostname.includes(".rds.amazonaws.com") ||
    Boolean(sslMode && sslMode !== "disable")
  );
}

/**
 * Normalize DATABASE_URL for AWS RDS.
 * Keeps encryption on, but avoids Node/pg verify-full failures on the RDS cert chain.
 */
export function getDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  const url = parseDatabaseUrl(raw);

  if (!url || !isPostgresUrl(url) || !shouldUsePostgresSsl(url)) {
    return raw;
  }

  if (!url.searchParams.get("sslmode")) {
    url.searchParams.set("sslmode", "require");
  }

  // Prisma / pg: encrypted connection without strict CA chain validation.
  url.searchParams.set("sslaccept", "accept_invalid_certs");
  url.searchParams.set("uselibpqcompat", "true");

  return url.toString();
}

export function getDatabaseUrlParts() {
  const url = parseDatabaseUrl(getDatabaseUrl() || process.env.DATABASE_URL);
  if (!url) return null;

  return {
    host: url.hostname,
    port: Number(url.port || 5432),
    database: url.pathname.replace(/^\//, ""),
    user: decodeURIComponent(url.username || ""),
    sslMode: url.searchParams.get("sslmode"),
    sslAccept: url.searchParams.get("sslaccept"),
  };
}

export function isProductionEnv() {
  return process.env.NODE_ENV === "production";
}

export function isTruthyEnv(name) {
  const value = String(process.env[name] ?? "")
    .trim()
    .toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

/** Set EXPOSE_API_ERRORS=true in prod temporarily to see real 5xx messages in API responses. */
export function shouldExposeApiErrors() {
  return !isProductionEnv() || isTruthyEnv("EXPOSE_API_ERRORS");
}

export function getResponseErrorStatus(statusCode, payload) {
  const bodyCode =
    payload && typeof payload === "object" && Number.isFinite(Number(payload.code))
      ? Number(payload.code)
      : 0;

  return Math.max(Number(statusCode) || 0, bodyCode);
}

export function sanitizeErrorPayload(payload, statusCode = 500) {
  const effectiveStatus = getResponseErrorStatus(statusCode, payload);

  if (shouldExposeApiErrors() || effectiveStatus < 500 || !payload || typeof payload !== "object") {
    return payload;
  }

  return {
    ...payload,
    message: "Internal server error",
    ...(Object.prototype.hasOwnProperty.call(payload, "stack") ? { stack: undefined } : {}),
  };
}

export function publicErrorMessage(error, fallback = "Internal server error") {
  return shouldExposeApiErrors() ? error?.message || fallback : fallback;
}

export function logApiError(req, statusCode, payload) {
  const effectiveStatus = getResponseErrorStatus(statusCode, payload);
  if (effectiveStatus < 500) return;

  const message =
    payload && typeof payload === "object" && payload.message
      ? String(payload.message)
      : "Unknown server error";

  console.error(
    `[API ${effectiveStatus}] ${req.method} ${req.originalUrl} -> ${message}`
  );

  if (payload && typeof payload === "object" && payload.stack) {
    console.error(payload.stack);
  }
}

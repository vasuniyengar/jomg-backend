export function isProductionEnv() {
  return process.env.NODE_ENV === "production";
}

export function sanitizeErrorPayload(payload, statusCode = 500) {
  if (!isProductionEnv() || statusCode < 500 || !payload || typeof payload !== "object") {
    return payload;
  }

  return {
    ...payload,
    message: "Internal server error",
    ...(Object.prototype.hasOwnProperty.call(payload, "stack") ? { stack: undefined } : {}),
  };
}

export function publicErrorMessage(error, fallback = "Internal server error") {
  return isProductionEnv() ? fallback : error?.message || fallback;
}

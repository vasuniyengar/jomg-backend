export function isProductionEnv() {
  return process.env.NODE_ENV === "production";
}

/** Set EXPOSE_API_ERRORS=true in prod temporarily to see real 5xx messages in API responses. */
export function shouldExposeApiErrors() {
  return !isProductionEnv() || process.env.EXPOSE_API_ERRORS === "true";
}

export function sanitizeErrorPayload(payload, statusCode = 500) {
  if (shouldExposeApiErrors() || statusCode < 500 || !payload || typeof payload !== "object") {
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

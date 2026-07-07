import { publicErrorMessage, shouldExposeApiErrors } from "../utils/errorResponse.js";

export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  console.error(err);

  res.status(status).json({
    code: status,
    error: true,
    message: status >= 500 ? publicErrorMessage(err) : err.message || "Request failed",
    ...(shouldExposeApiErrors() ? { stack: err.stack } : {}),
  });
}

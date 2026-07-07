import { isProductionEnv, publicErrorMessage } from "../utils/errorResponse.js";

export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const isProd = isProductionEnv();

  console.error(err);

  res.status(status).json({
    code: status,
    error: true,
    message: status >= 500 ? publicErrorMessage(err) : err.message || "Request failed",
    ...(isProd ? {} : { stack: err.stack }),
  });
}

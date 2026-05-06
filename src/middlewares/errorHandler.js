export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    console.error(err);
  }

  res.status(status).json({
    code: status,
    error: true,
    message: err.message || "Internal server error",
    ...(isProd ? {} : { stack: err.stack }),
  });
}

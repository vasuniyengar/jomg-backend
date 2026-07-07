import "dotenv/config";
import process from "node:process";
import path from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// import s3Client from "./src/config/s3Client.js";
// import sqsClient from "./src/config/sqsClient.js";
import prisma from "./src/config/prisma.js";
import { getDatabaseConnectionInfo } from "./src/config/database.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import {
  logApiError,
  sanitizeErrorPayload,
  shouldExposeApiErrors,
} from "./src/utils/errorResponse.js";

const port = process.env.PORT || 5000;

import authRoutes from "./src/routes/authRoutes.js";
import authSigninRoutes from "./src/routes/authSigninRoutes.js";

import userRoutes from "./src/routes/userRoutes.js";

import clubRoutes from "./src/routes/clubRoutes.js";

import tournamentRoutes from "./src/routes/tournamentRoutes.js";

import bracketRoutes from "./src/routes/bracketRoutes.js";

import eventRoutes from "./src/routes/eventRoutes.js";

import playerRoutes from "./src/routes/playerRoutes.js";

import hostRoutes from "./src/routes/hostRoutes.js";

import verifyRoutes from "./src/routes/verifyRoutes.js";
import playoffRoutes from "./src/routes/playoffRoutes.js";

import playerRegistrationRoutes from "./src/routes/playerRegistrationRoutes.js";
import roundRobinRouter from "./src/routes/roundRobinRoutes.js";
import publicTournamentRoutes from "./src/routes/publicTournamentRoutes.js";



const app = express();

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    logApiError(req, res.statusCode, payload);
    return originalJson(sanitizeErrorPayload(payload, res.statusCode));
  };

  next();
});

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const frontendUrl = (process.env.FRONTEND_URL || "").trim();
if (frontendUrl && !allowedOrigins.includes(frontendUrl)) {
  allowedOrigins.push(frontendUrl);
}

const isDev = process.env.NODE_ENV !== "production";
const isLocalOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const isPrivateLanOrigin = (origin) =>
  /^https?:\/\/(?:192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
    origin
  );

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (isDev && (isLocalOrigin(origin) || isPrivateLanOrigin(origin))) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin denied"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: process.env.BODY_LIMIT || "1mb" }));

app.use(express.urlencoded({ extended: true, limit: process.env.BODY_LIMIT || "1mb" }));

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.AUTH_RATE_LIMIT_MAX || 100),
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health-check", (req, res) => {
  return res.status(200).json({
    code: 200,
    error: false,
    message: "Server up and running",
  });
});

app.use("/auth", verifyRoutes);

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);
app.use("/api", authSigninRoutes);
app.use("/api/round-robin", roundRobinRouter);
app.use("/api/clubs", clubRoutes);

app.use("/api/tournaments", tournamentRoutes);

app.use("/api/public/tournaments", publicTournamentRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// app.use("/uploads", express.static("uploads"));

app.use("/api/bracket", bracketRoutes);

app.use("/api/events", eventRoutes);

// app.use("/api/players", playerRoutes);

app.use("/api/tournaments", playoffRoutes);
app.use("/api/players", playerRegistrationRoutes);

app.use("/api/host", hostRoutes);

app.use(errorHandler);

let httpServer;

function logDatabaseStartup(context) {
  const info = getDatabaseConnectionInfo();
  console.log(
    `[${context}] DB config host=${info.host} port=${info.port} db=${info.database} dialect=${info.dialect} ssl=${info.sslEnabled ? "enabled" : "disabled"} source=${info.source}`
  );
}

const startServer = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    if (!process.env.JWT_SECRET && !process.env.ACCESS_TOKEN_JWT_SECRET) {
      throw new Error("JWT_SECRET or ACCESS_TOKEN_JWT_SECRET is not set");
    }

    logDatabaseStartup("API");
    console.log(
      `[API] EXPOSE_API_ERRORS=${shouldExposeApiErrors() ? "enabled" : "disabled"}`
    );
    await prisma.$queryRaw`SELECT 1`;

    console.log("database connected");
    httpServer = app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
    });

    httpServer.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Port ${port} is already in use. Stop the other process (e.g. lsof -i :${port}) and restart.`
        );
      } else {
        console.error("HTTP server error:", err);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Startup failure", error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down...`);
  try {
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Graceful shutdown failed", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();

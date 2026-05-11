import dotenv from "dotenv";
import process from "node:process";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

// import s3Client from "./src/config/s3Client.js";
// import sqsClient from "./src/config/sqsClient.js";
import prisma from "./src/config/prisma.js";
import errorHandler from "./src/middlewares/errorHandler.js";

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

import playerRegistrationRoutes from "./src/routes/playerRegistrationRoutes.js";

import savePlayers from "./src/routes/savePlayers.js";

const app = express();

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
      if (isDev && isLocalOrigin(origin)) {
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

app.use("/api/clubs", clubRoutes);

app.use("/api/tournaments", tournamentRoutes);

// app.use("/uploads", express.static("uploads"));

app.use("/api/bracket", bracketRoutes);

app.use("/api/events", eventRoutes);

// app.use("/api/players", playerRoutes);

app.use("/api/players", playerRegistrationRoutes);

app.use("/api/host", hostRoutes);

app.use("/api/players", savePlayers);

app.use(errorHandler);

let httpServer;

const startServer = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    console.log("database connected");
    httpServer = app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
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

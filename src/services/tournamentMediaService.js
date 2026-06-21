import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3Client.js";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

const S3_BASE_URL = (
  process.env.AWS_S3_BASE_URL ||
  "https://s3.us-east-1.amazonaws.com/pb-images-storage/"
).replace(/\/$/, "");

const MIME_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function getMediaStorageMode() {
  const mode = String(process.env.MEDIA_STORAGE || "auto").toLowerCase();
  if (mode === "local" || mode === "s3") return mode;

  if (process.env.NODE_ENV !== "production") {
    return "local";
  }

  const hasAws =
    process.env.AWS_BUCKET_NAME &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY;

  return hasAws ? "s3" : "local";
}

export function getLocalMediaBaseUrl() {
  const base =
    process.env.LOCAL_MEDIA_BASE_URL ||
    process.env.SERVER_BASE_URL ||
    `http://127.0.0.1:${process.env.PORT || 4000}`;
  return `${String(base).replace(/\/$/, "")}/uploads`;
}

export function resolveMediaUrl(key) {
  if (!key || typeof key !== "string") return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;

  if (getMediaStorageMode() === "local") {
    return `${getLocalMediaBaseUrl()}/${key.replace(/^\//, "")}`;
  }

  return `${S3_BASE_URL}/${key.replace(/^\//, "")}`;
}

export function extractMediaKey(value) {
  if (!value || typeof value !== "string") return null;

  const localBase = getLocalMediaBaseUrl();
  if (value.startsWith(`${localBase}/`)) {
    return value.substring(localBase.length + 1);
  }

  if (value.startsWith(S3_BASE_URL + "/")) {
    return value.substring(S3_BASE_URL.length + 1);
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const url = new URL(value);
      return url.pathname.replace(/^\//, "");
    } catch {
      return value;
    }
  }

  return value;
}

function buildObjectKey(tournamentId, purpose, mimeType) {
  const ext = MIME_EXT[mimeType] || "jpg";
  const id = crypto.randomUUID();
  return `tournaments/${tournamentId}/${purpose}/${id}.${ext}`;
}

async function uploadToLocal({ key, buffer }) {
  const filePath = path.join(UPLOADS_ROOT, key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
  return { key, url: resolveMediaUrl(key) };
}

async function uploadToS3({ key, buffer, mimeType }) {
  if (!process.env.AWS_BUCKET_NAME) {
    const err = new Error(
      "S3 is not configured. Set AWS_BUCKET_NAME or use MEDIA_STORAGE=local."
    );
    err.status = 503;
    throw err;
  }

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );
  } catch (error) {
    const message = String(error?.message || "");
    if (/Access Key Id|InvalidAccessKeyId|SignatureDoesNotMatch/i.test(message)) {
      const err = new Error(
        "S3 credentials are invalid. Fix AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY in backend .env, or set MEDIA_STORAGE=local for file-based uploads."
      );
      err.status = 503;
      throw err;
    }
    throw error;
  }

  return { key, url: resolveMediaUrl(key) };
}

export async function uploadTournamentImage({
  tournamentId,
  buffer,
  mimeType,
  purpose = "media",
}) {
  const key = buildObjectKey(tournamentId, purpose, mimeType);
  const mode = getMediaStorageMode();

  if (mode === "local") {
    return uploadToLocal({ key, buffer });
  }

  return uploadToS3({ key, buffer, mimeType });
}

export async function deleteTournamentImage(key) {
  const normalized = extractMediaKey(key);
  if (!normalized) return;

  if (getMediaStorageMode() === "local") {
    try {
      await fs.unlink(path.join(UPLOADS_ROOT, normalized));
    } catch {
      /* ignore missing files */
    }
    return;
  }

  if (!process.env.AWS_BUCKET_NAME) return;

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: normalized,
      })
    );
  } catch {
    /* ignore delete failures */
  }
}

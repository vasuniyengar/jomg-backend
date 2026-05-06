# JOMG Backend Setup Guide

This guide is a complete local setup flow for backend API + PostgreSQL + auth so login works without missing steps.

## 1) Prerequisites

- Node.js `>=20`
- npm
- Docker + Docker Compose
- Ports available:
  - Backend: `4000` or `5000` (based on your `.env`)
  - Postgres: `5432`

## 2) Install dependencies

From backend project root:

```bash
npm install
```

## 3) Configure environment

Copy env template:

```bash
cp .env.example .env
```

Update `.env` (minimum required keys):

- `PORT=4000` (or keep `5000`, but make frontend match)
- `DATABASE_URL=postgresql://jomg:jomg_password@localhost:5432/jomg?schema=public`
- `POSTGRES_DB=jomg`
- `POSTGRES_USER=jomg`
- `POSTGRES_PASSWORD=jomg_password`
- `JWT_SECRET=change_me_to_a_strong_value`
- `CORS_ALLOWED_ORIGINS=http://localhost:3000`
- `FRONTEND_URL=http://localhost:3000`

## 4) Start PostgreSQL

From backend root:

```bash
docker compose up -d postgres
```

Check container health:

```bash
docker compose ps
```

## 5) Initialize database (Prisma)

Run these commands in order:

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
```

## 6) Start backend API

```bash
npm start
```

Expected log output includes:

- `database connected`
- `Server is running on port <PORT>`

## 7) Create or verify login users

### Option A: Use seeded users

Seed script creates default auth users:

- `admin@jomg.com` (`super_admin`)
- `organizer@jomg.com` (`organizer`)

Passwords come from seed defaults or env values used by `prisma/seed.js`.


## 8) API smoke checks

Health check:

```bash
curl http://localhost:4000/health-check
```


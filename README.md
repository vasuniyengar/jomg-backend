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

## 6) Email queue (async mail)

Registration and payment emails are sent via **AWS SQS** so the API returns immediately.

Add to `.env`:

- `EMAIL_QUEUE_URL` — SQS queue URL
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` — SMTP for the worker

Run the API and email worker together (recommended for local dev):

```bash
npm run dev
```

Or in two terminals:

```bash
npm start
npm run worker:email
```

Without the worker running, messages stay in the queue until `npm run worker:email` is started.

## 7) Start backend API

If you are not using `npm run dev`, start the API only:

```bash
npm start
```

Expected log output includes:

- `database connected`
- `Server is running on port <PORT>`

## 8) Create or verify login users

### Option A: Use seeded users

Seed script creates default auth users:

- `admin@jomg.com` (`super_admin`)
- `organizer@jomg.com` (`organizer`)

Passwords come from seed defaults or env values used by `prisma/seed.js`.

After seeding, the organizer account also gets sample clubs (e.g. **Austin Pickleball Club**) for tournament create/list flows.


## 9) API smoke checks

Health check:

```bash
curl http://localhost:4000/health-check
```


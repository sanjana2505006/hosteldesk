# HostelDesk

Campus hostel maintenance desk. Students file a complaint. Wardens assign a worker. An SLA clock turns red when a leak sits too long.

This is a **serious internship project**, not a Blinkit clone: same industry tools (Next.js, Prisma, Postgres, Docker, GitHub Actions), different problem.

## Why this exists

Every hostel already has the workflow. It just lives in a WhatsApp group:

1. Student texts the caretaker.
2. Message disappears under 200 others.
3. Nobody knows who owns the job.
4. The same tap leaks for a week.

HostelDesk turns that into tickets, roles, and a status machine you can defend in an interview.

## Demo

```bash
cp .env.example .env
# .env is already filled for local Docker Postgres
npm install
npm run docker:up
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

| Role    | Email                     | Password    |
| ------- | ------------------------- | ----------- |
| Student | `student@hosteldesk.dev`  | `student123` |
| Warden  | `warden@hosteldesk.dev`   | `warden123` |
| Worker  | `worker@hosteldesk.dev`   | `worker123` |
| Admin   | `admin@hosteldesk.dev`    | `admin123`  |

Seeded data includes **HD-1041** — a high-priority leak filed ~80 hours ago. High priority SLA is 24 hours, so the inbox shows it in red. The warden also has an unread alert for it. The student has one for **HD-1045**, the drain that is already resolved and waiting to be closed.

## Stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| App          | Next.js 14 App Router, TypeScript           |
| Auth         | NextAuth JWT + credentials, four roles      |
| Database     | PostgreSQL 16                               |
| ORM          | Prisma (schema + migrations + seed)         |
| Validation   | Zod on every write                          |
| Containers   | Docker Compose for Postgres (host port 5433) |
| CI           | GitHub Actions: lint, `prisma validate`, build |
| Deploy shape | `output: "standalone"` Dockerfile           |

## Domain rules (the interview part)

**Status machine** (`lib/status.ts`) — not every role can jump to every state:

```
OPEN → ASSIGNED | REJECTED | CLOSED
ASSIGNED → IN_PROGRESS | OPEN | REJECTED
IN_PROGRESS → WAITING_PARTS | RESOLVED | ASSIGNED
WAITING_PARTS → IN_PROGRESS | RESOLVED
RESOLVED → CLOSED | IN_PROGRESS
CLOSED → OPEN
```

- Warden / admin: full graph
- Worker: only on tickets assigned to them, and only `IN_PROGRESS` / `WAITING_PARTS` / `RESOLVED`
- Student: close a resolved ticket, or reopen a closed one

**SLA** (`lib/sla.ts`)

| Priority | Hours |
| -------- | ----- |
| Urgent   | 8     |
| High     | 24    |
| Medium   | 48    |
| Low      | 72    |

A ticket is breached if it is still open after that window. Resolved / closed / rejected tickets are not counted as late.

**Alerts** (`lib/notify.ts`)

The inbox is the queue. An alert is the tap on the shoulder, written in the same request as the ticket change.

| What happened | Who gets it |
| --- | --- |
| Student files a complaint | Wardens of that hostel |
| Assign, status change, or comment | The reporter and the assignee |

If nobody is assigned yet, the block warden gets the comment or status ping. You do not get an alert for your own click. Opening the ticket marks it read.

**Close-out rating**

A student can close a resolved ticket only after scoring the fix from 1 to 5. The server returns `400` if the rating is missing. Reopening clears it. Worker averages show on the people page. **HD-1046** is already closed at 4/5. **HD-1045** is resolved and waiting for the student to close and rate it.

**Visibility**

- Student: own tickets
- Worker: assigned jobs
- Warden: their hostel
- Admin: everything

## Project shape

```
app/(desk)/inbox          role-aware queue + SLA counts
app/(desk)/alerts         unread pings for the other people on a ticket
app/(desk)/board          warden kanban
app/(desk)/tickets/new    file a complaint + photo
app/(desk)/tickets/[id]   timeline, assign, status moves
app/api/tickets           Zod-validated writes + event log
prisma/schema.prisma      Hostels, users, tickets, events
.github/workflows/ci.yml  lint · validate · build
docker-compose.yml        Postgres 16
```

Every status change and assignment writes a `TicketEvent`. That timeline is the audit log.

## Scripts

```bash
npm run docker:up      # start Postgres
npm run db:migrate     # apply Prisma migrations
npm run db:seed        # demo hostels, people, tickets
npm run db:studio      # browse the database
npm run dev
npm run lint
npm run build
```

## Deploy later (when the demo is solid)

1. Push to GitHub — CI should go green.
2. Postgres on [Neon](https://neon.tech), app on [Vercel](https://vercel.com).
3. Set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` on Vercel.
4. `npx prisma migrate deploy` against Neon.
5. Put the live URL on your resume.

Local photo uploads land in `public/uploads`. On Vercel that disk is ephemeral — swap the upload route for Cloudinary or Vercel Blob before production.

## What to say in the interview

- I did **not** clone a delivery app. I modeled a real campus ops queue.
- Double-submit and illegal status jumps are rejected on the server (`409`), not only hidden in the UI.
- SLA is computed from `createdAt + priority`, not a stored flag that can drift.
- Alerts are rows written in the same request as the ticket change. The red badge is a count of unread rows, and I don't get one for my own click.
- A student cannot close a resolved ticket without a 1 to 5 rating. That check is on the server, same as an illegal status jump.
- Docker is how another machine (or CI) gets the same Postgres.
- GitHub Actions is how I know `main` still builds.

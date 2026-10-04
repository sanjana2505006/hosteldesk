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
| Database     | PostgreSQL 16 for tickets; MongoDB 7 for notices |
| API          | Next routes for the desk; Express for notices    |
| ORM          | Prisma (schema + migrations + seed)         |
| Validation   | Zod on every write                          |
| Containers   | Docker Compose: Postgres on 5433, Mongo on 27017 |
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
- Student: take back an open ticket nobody is on, close a resolved one, or reopen a closed one

**Take it back**

A student can close their own ticket while it is still open and unassigned. That is the "filed the wrong room" case. If a worker is already on it, the server returns `409`. Sign in as the student and file a small one, housekeeping for A-214, then hit **Take it back**. Leave **HD-1041** alone. That leak is the late one in the inbox.

**Waiting on parts**

Parking a ticket on waiting for parts needs the part name in the note. An empty note returns `400`, same as closing without a rating. Sign in as the worker and open **HD-1042** (Wi-Fi, already in progress). "Mark waiting on parts" with a blank note is refused. "Capacitor for the access point" goes through and shows up on the timeline.

**SLA** (`lib/sla.ts`)

| Priority | Hours |
| -------- | ----- |
| Urgent   | 8     |
| High     | 24    |
| Medium   | 48    |
| Low      | 72    |

A ticket is breached if it is still open after that window. Resolved / closed / rejected tickets are not counted as late. Hours spent **waiting on parts** are left out. That gap is read from the timeline (`Status → Waiting on parts` until the next status line), not stored as its own due date. While the ticket is parked, the badge says **paused** and the late count ignores it. If it was already late before the part was ordered, it stays red.

**HD-1044** is the ceiling fan. Medium is 48 hours, and it was filed about 56 hours ago, so the wall clock is past the window. It has been waiting on a capacitor for the last 20 hours, so the inbox does not mark it late. **HD-1041** is still the red one — that leak was never parked.

**Change priority**

A warden or admin can raise or lower priority while the ticket is still open. The window is still `createdAt + priority`, so the clock moves and no due date is stored. Resolved, closed, and rejected tickets return `409`. A student or worker gets `403`. The change is written as an event and an alert, same as an assign.

**HD-1043** is the loose chair, low priority, filed about 20 hours ago. Low is 72 hours, so it is not late. Sign in as the warden, set it to urgent (8 hours), and the inbox turns it red.

**Alerts** (`lib/notify.ts`)

The inbox is the queue. An alert is the tap on the shoulder, written in the same request as the ticket change.

| What happened | Who gets it |
| --- | --- |
| Student files a complaint | Wardens of that hostel |
| Assign, status change, or comment | The reporter and the assignee |

If nobody is assigned yet, the block warden gets the comment or status ping. You do not get an alert for your own click. Opening the ticket marks it read.

**Close-out rating**

A student can close a resolved ticket only after scoring the fix from 1 to 5. The server returns `400` if the rating is missing. Reopening clears it. Worker averages show on the people page. **HD-1046** is already closed at 4/5. **HD-1045** is resolved and waiting for the student to close and rate it.

**Inbox filters**

The four counts stay on the whole queue. The list can be narrowed by room, ref, title, status, category, or late tickets only. Late still comes from the SLA clock.

**Same room**

A ticket page lists the other complaints for that room and block. It uses the same visibility as the inbox, so a student only sees their own and a worker only sees jobs assigned to them. Open **HD-1041** as the warden: A-214 already has the Wi-Fi, the chair, the fan, and the drain.

**Who is busy**

The assign menu shows how many tickets that worker still has open. Resolved, closed, and rejected jobs are left out. On the seeded desk Suresh is on the Wi-Fi and the fan, so he shows 2 open. Ramesh has the chair, so he shows 1.

**No second ticket**

The same room cannot have two open tickets in one category. Resolved, closed, and rejected ones do not block a new filing. Try plumbing for A-214 as the student: **HD-1041** is still open, so the form returns 409 and links to it.

**Notice board**

Tickets stay in Postgres. Notices are a small Express app (`server/index.js`) on MongoDB. The page checks who is signed in, then calls Express with `DESK_API_KEY`. A warden’s post stays on their block. An admin’s post is for the whole campus. Students see campus notices plus their own block. Anyone signed in can hit **Got it**. Express stores the name on that notice, and a second click does not add it again. Sign in as the student, mark the water notice, then open the board as the warden — Aarav Mehta should be listed under it.

```bash
npm run docker:up    # Postgres and Mongo
npm run server       # Express on port 4000, in a second terminal
npm run dev
```

**Visibility**

- Student: own tickets
- Worker: assigned jobs
- Warden: their hostel
- Admin: everything

## Project shape

```
app/(desk)/inbox          role-aware queue, SLA counts, filters
app/(desk)/alerts         unread pings for the other people on a ticket
app/(desk)/notices        notice board, read from Express
server/index.js           Express API, MongoDB
app/(desk)/board          warden kanban
app/(desk)/tickets/new    file a complaint + photo
app/(desk)/tickets/[id]   timeline, assign, status moves, other tickets for the room
app/api/tickets           Zod-validated writes + event log
prisma/schema.prisma      Hostels, users, tickets, events
.github/workflows/ci.yml  lint · validate · build
docker-compose.yml        Postgres 16 and MongoDB 7
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
- SLA is computed from `createdAt + priority`, not a stored flag that can drift. Waiting on parts does not count. That pause is the gap between timeline lines, so a ticket parked on a capacitor is not late just because the wall clock passed.
- A warden can change that priority. The window moves with it. A finished ticket returns `409`, and a student cannot do it.
- Alerts are rows written in the same request as the ticket change. The red badge is a count of unread rows, and I don't get one for my own click.
- A student cannot close a resolved ticket without a 1 to 5 rating. That check is on the server, same as an illegal status jump.
- A student can take back an open ticket before anyone is assigned. If a worker is already on it, that is a `409`.
- Waiting on parts needs the part name. A blank note returns `400`.
- Inbox filters narrow the list. The SLA count above them is still the whole queue. Waiting on parts is not counted in that clock.
- The ticket page lists the other complaints for that room. A student still only sees their own.
- The assign menu shows how many open jobs a worker already has. A resolved ticket is not counted.
- The notice board is Express and Mongo. The ticket desk is still Postgres. Next only forwards the post after checking the role.
- Got it on a notice is stored on that Mongo document. Hitting it twice does not add my name again.
- The same room cannot get a second open ticket in the same category. That is a 409, with a link to the one already on file.
- Docker is how another machine (or CI) gets the same Postgres.
- GitHub Actions is how I know `main` still builds.

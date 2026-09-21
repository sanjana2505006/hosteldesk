# HostelDesk

Campus hostel maintenance desk. Students file complaints, wardens assign workers, and an SLA clock keeps leaks from sitting in a WhatsApp group.

## Local setup

```bash
npm install
cp .env.example .env
docker compose up -d
npx prisma migrate dev
npm run dev
```

Postgres is on port 5433 because 5432 is already used on my machine.

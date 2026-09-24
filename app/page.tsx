import Link from "next/link";

const roles = [
  {
    title: "Student",
    body: "File a leak, a dead fan, a stuck latch. Photo, room, priority. Track it without pinging the warden twice.",
  },
  {
    title: "Warden",
    body: "One inbox. Assign the plumber. See which tickets blew their SLA. No more scrolling a 400-message group.",
  },
  {
    title: "Worker",
    body: "Your jobs, your status moves: in progress, waiting on parts, resolved. The timeline is the record.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <p className="font-serif text-xl text-forest">HostelDesk</p>
        <div className="flex gap-3 text-sm">
          <Link href="/login" className="rounded-md px-3 py-1.5 text-ink/70 hover:text-ink">
            Sign in
          </Link>
          <Link href="/login" className="rounded-md bg-forest px-3 py-1.5 text-paper">
            Open the desk
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        <section className="grid gap-10 pb-16 pt-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="stamp border-rust/40 text-rust">Campus operations · not another grocery clone</p>
            <h1 className="mt-5 font-serif text-5xl leading-[1.05] text-ink md:text-6xl">
              The warden’s desk,
              <br />
              without the WhatsApp group.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink/65">
              Hostel complaints get a ticket, a worker, and a clock. If a leak sits past its SLA, the board turns red — not the group chat.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-md bg-rust px-5 py-2.5 text-sm font-medium text-white">
                Try the demo
              </Link>
              <a href="#stack" className="rounded-md border border-line px-5 py-2.5 text-sm text-ink/70">
                See the stack
              </a>
            </div>
          </div>
          <aside className="rounded-lg border border-line bg-panel p-5 shadow-desk">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/40">Demo logins</p>
            <ul className="mt-3 space-y-2 font-mono text-xs text-ink/80">
              <li>student@hosteldesk.dev / student123</li>
              <li>warden@hosteldesk.dev / warden123</li>
              <li>worker@hosteldesk.dev / worker123</li>
              <li>admin@hosteldesk.dev / admin123</li>
            </ul>
            <p className="mt-4 text-xs text-ink/45">Seeded tickets include a 3-day leak that has already breached SLA.</p>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {roles.map((role) => (
            <article key={role.title} className="rounded-lg border border-line bg-panel p-5">
              <h2 className="font-serif text-2xl text-forest">{role.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/65">{role.body}</p>
            </article>
          ))}
        </section>

        <section id="stack" className="mt-16 rounded-lg border border-forest/20 bg-forest px-6 py-8 text-paper">
          <p className="text-[11px] uppercase tracking-[0.18em] text-paper/50">What you can defend in an interview</p>
          <div className="mt-4 grid gap-6 md:grid-cols-5">
            {[
              ["Next.js 14", "App Router, role-aware pages"],
              ["Prisma", "Users, hostels, tickets, events"],
              ["PostgreSQL", "Docker Compose, migrations"],
              ["NextAuth", "JWT + credentials, four roles"],
              ["GitHub Actions", "lint · validate · build"],
            ].map(([name, detail]) => (
              <div key={name}>
                <p className="font-serif text-xl">{name}</p>
                <p className="mt-1 text-xs text-paper/60">{detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

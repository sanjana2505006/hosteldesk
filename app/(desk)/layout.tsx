import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { ROLE_LABEL } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const staff = user.role === "WARDEN" || user.role === "ADMIN";
  const unread = await prisma.alert.count({
    where: { userId: user.id, readAt: null },
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3">
          <div>
            <Link href="/inbox" className="font-semibold text-ink">
              HostelDesk
            </Link>
            <p className="text-xs text-ink/50">
              {user.name} · {ROLE_LABEL[user.role]}
              {user.hostelName ? ` · ${user.hostelName}` : ""}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <Link href="/inbox" className="rounded-md px-3 py-1.5 text-ink/70 hover:bg-ink/5">
              Inbox
            </Link>
            <Link href="/alerts" className="rounded-md px-3 py-1.5 text-ink/70 hover:bg-ink/5">
              Alerts
              {unread ? (
                <span className="ml-1.5 rounded-full bg-rust px-1.5 py-0.5 text-[10px] text-white">
                  {unread}
                </span>
              ) : null}
            </Link>
            <Link href="/notices" className="rounded-md px-3 py-1.5 text-ink/70 hover:bg-ink/5">
              Notices
            </Link>
            {user.role !== "WORKER" ? (
              <Link href="/tickets/new" className="rounded-md px-3 py-1.5 text-ink/70 hover:bg-ink/5">
                New ticket
              </Link>
            ) : null}
            {staff ? (
              <Link href="/board" className="rounded-md px-3 py-1.5 text-ink/70 hover:bg-ink/5">
                Board
              </Link>
            ) : null}
            {staff ? (
              <Link href="/people" className="rounded-md px-3 py-1.5 text-ink/70 hover:bg-ink/5">
                People
              </Link>
            ) : null}
            <SignOutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}

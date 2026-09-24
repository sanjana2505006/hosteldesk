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
      <header className="border-b border-forest-800 bg-forest text-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link href="/inbox" className="font-serif text-xl">
              HostelDesk
            </Link>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-paper/55">
              {user.name} · {ROLE_LABEL[user.role]}
              {user.hostelName ? ` · ${user.hostelName}` : ""}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/inbox" className="hover:text-white">
              Inbox
            </Link>
            <Link href="/alerts" className="hover:text-white">
              Alerts
              {unread ? (
                <span className="ml-1.5 rounded-sm bg-rust px-1.5 py-0.5 font-mono text-[10px] text-white">
                  {unread}
                </span>
              ) : null}
            </Link>
            {user.role !== "WORKER" ? (
              <Link href="/tickets/new" className="hover:text-white">
                New ticket
              </Link>
            ) : null}
            {staff ? (
              <Link href="/board" className="hover:text-white">
                Board
              </Link>
            ) : null}
            {staff ? (
              <Link href="/people" className="hover:text-white">
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

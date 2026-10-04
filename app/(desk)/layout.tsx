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
      <header className="frost sticky top-0 z-20 border-b border-black/10">
        <div className="mx-auto flex min-h-12 max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-2">
          <Link href="/inbox" className="text-[15px] font-semibold tracking-tight text-ink">
            HostelDesk
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-ink/80">
            <Link href="/inbox" className="transition-colors duration-200 hover:text-ink">
              Inbox
            </Link>
            <Link href="/alerts" className="transition-colors duration-200 hover:text-ink">
              Alerts
              {unread ? (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rust px-1 text-[10px] text-white">
                  {unread}
                </span>
              ) : null}
            </Link>
            <Link href="/notices" className="transition-colors duration-200 hover:text-ink">
              Notices
            </Link>
            {user.role !== "WORKER" ? (
              <Link href="/tickets/new" className="transition-colors duration-200 hover:text-ink">
                New ticket
              </Link>
            ) : null}
            {staff ? (
              <Link href="/board" className="transition-colors duration-200 hover:text-ink">
                Board
              </Link>
            ) : null}
            {staff ? (
              <Link href="/people" className="transition-colors duration-200 hover:text-ink">
                People
              </Link>
            ) : null}
            <span className="text-ink/40">
              {user.name} · {ROLE_LABEL[user.role]}
            </span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}

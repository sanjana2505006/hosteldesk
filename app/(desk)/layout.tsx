import { redirect } from "next/navigation";
import { DeskLink, DeskNav } from "@/components/desk-nav";
import { ROLE_LABEL } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const unread = await prisma.alert.count({
    where: { userId: user.id, readAt: null },
  });

  const links: DeskLink[] = [];
  if (user.role === "STUDENT") {
    links.push({ href: "/inbox", label: "Complaints" }, { href: "/tickets/new", label: "New ticket" });
  } else if (user.role === "WORKER") {
    links.push({ href: "/inbox", label: "Jobs" });
  } else {
    links.push(
      { href: "/inbox", label: "Inbox" },
      { href: "/board", label: "Board" },
      { href: "/people", label: "People" },
      { href: "/tickets/new", label: "New ticket" },
    );
  }
  links.push({ href: "/alerts", label: "Alerts", badge: unread || undefined }, { href: "/notices", label: "Notices" });

  return (
    <div className="min-h-screen">
      <DeskNav name={user.name ?? "Signed in"} roleLabel={ROLE_LABEL[user.role]} links={links} />
      <div className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 md:pb-8">{children}</div>
    </div>
  );
}

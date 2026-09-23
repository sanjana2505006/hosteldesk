import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TicketsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const tickets = await prisma.ticket.findMany({
    where: { createdById: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-2xl p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My complaints</h1>
        <Link href="/tickets/new" className="rounded bg-black px-3 py-2 text-sm text-white">
          new complaint
        </Link>
      </div>

      {tickets.length === 0 ? (
        <p className="mt-6 text-sm text-gray-600">nothing filed yet</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {tickets.map((t) => (
            <li key={t.id} className="rounded border p-4">
              <p className="font-medium">{t.title}</p>
              <p className="mt-1 text-sm text-gray-600">
                {t.category} · {t.roomNo} · {t.status.toLowerCase()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-sm">
        <Link href="/" className="underline">
          back home
        </Link>
      </p>
    </main>
  );
}

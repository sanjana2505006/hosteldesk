import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./logout-button";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const hostelCount = await prisma.hostel.count();

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold">HostelDesk</h1>
      <p className="mt-3 text-gray-600">
        Hostel complaint system for our campus. Still setting this up.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        Hostels in database: {hostelCount}
      </p>

      <div className="mt-6 text-sm">
        {session?.user ? (
          <p>
            logged in as {session.user.name} ({session.user.role}) · <LogoutButton />
          </p>
        ) : (
          <p>
            <Link href="/login" className="underline">
              login
            </Link>
            {" · "}
            <Link href="/register" className="underline">
              register
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

import { prisma } from "@/lib/prisma";

export default async function Home() {
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
    </main>
  );
}

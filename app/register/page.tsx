import { prisma } from "@/lib/prisma";
import { RegisterForm } from "./register-form";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const hostels = await prisma.hostel.findMany({
    orderBy: { block: "asc" },
  });

  return (
    <main className="mx-auto max-w-md p-10">
      <h1 className="text-2xl font-bold">Register</h1>
      <p className="mt-2 text-sm text-gray-600">student account only for now</p>
      {hostels.length === 0 ? (
        <p className="mt-6 text-sm text-red-600">
          no hostels yet. run npm run db:seed first.
        </p>
      ) : (
        <RegisterForm hostels={hostels} />
      )}
    </main>
  );
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewTicketForm } from "./form";

export default async function NewTicketPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return (
    <main className="mx-auto max-w-lg p-10">
      <h1 className="text-2xl font-bold">New complaint</h1>
      <p className="mt-2 text-sm text-gray-600">tell us what is broken</p>
      <NewTicketForm defaultRoom={me?.roomNo || ""} />
    </main>
  );
}

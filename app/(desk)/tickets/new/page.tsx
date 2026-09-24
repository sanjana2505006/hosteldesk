import { redirect } from "next/navigation";
import { TicketForm } from "@/components/ticket-form";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function NewTicketPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (user.role === "WORKER") redirect("/inbox");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-4xl text-ink">File a complaint</h1>
      <p className="mt-2 text-sm text-ink/55">
        Be specific — room, what’s failing, and how long. The SLA clock starts the moment you submit.
      </p>
      <div className="mt-8 rounded-lg border border-line bg-panel p-6 shadow-desk">
        <TicketForm defaultRoom={user.roomNumber} />
      </div>
    </div>
  );
}

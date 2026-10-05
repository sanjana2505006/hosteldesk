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
      <h1 className="text-2xl font-semibold text-ink">File a complaint</h1>
      <p className="mt-2 text-base text-ink/55">
        {user.role === "STUDENT"
          ? `Say what’s wrong in room ${user.roomNumber ?? "on your account"}. A warden assigns the worker. You can only file for your own room.`
          : "Be specific — room, what’s failing, and how long. The SLA clock starts the moment you submit. If this room already has that category open, this form will not open a second ticket."}
      </p>
      <div className="mt-8 rounded-lg border border-line bg-panel p-4 shadow-desk sm:p-6">
        <TicketForm defaultRoom={user.roomNumber} lockRoom={user.role === "STUDENT"} />
      </div>
    </div>
  );
}

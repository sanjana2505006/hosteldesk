"use client";

import { Role, TicketStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { STATUS_LABEL } from "@/lib/labels";
import { nextActions } from "@/lib/status";

type Worker = { id: string; name: string };

export function TicketActions({
  ticketId,
  status,
  role,
  isAssignee,
  isReporter,
  canAssignRole,
  workers,
  assigneeId,
}: {
  ticketId: string;
  status: TicketStatus;
  role: Role;
  isAssignee: boolean;
  isReporter: boolean;
  canAssignRole: boolean;
  workers: Worker[];
  assigneeId?: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const actions = nextActions(status, { role, isAssignee, isReporter });

  async function setStatus(next: TicketStatus) {
    setError("");
    const res = await fetch(`/api/tickets/${ticketId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next, note: note || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not update.");
      return;
    }
    setNote("");
    router.refresh();
  }

  async function assign(id: string | null) {
    setError("");
    const res = await fetch(`/api/tickets/${ticketId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId: id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not assign.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-lg border border-line bg-panel p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Actions</p>
      {canAssignRole ? (
        <label className="block text-sm">
          Assign worker
          <select
            defaultValue={assigneeId ?? ""}
            onChange={(e) => assign(e.target.value || null)}
            className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
          >
            <option value="">Unassigned</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {actions.length ? (
        <label className="block text-sm">
          Note (optional)
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
            placeholder="Visited room, waiting for a washer…"
          />
        </label>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => setStatus(action)}
            className="rounded-md border border-forest/30 px-3 py-1.5 text-sm text-forest hover:bg-forest/10"
          >
            Mark {STATUS_LABEL[action].toLowerCase()}
          </button>
        ))}
        {!actions.length ? <p className="text-sm text-ink/45">No status moves from here for your role.</p> : null}
      </div>
      {error ? <p className="text-sm text-rust">{error}</p> : null}
    </div>
  );
}

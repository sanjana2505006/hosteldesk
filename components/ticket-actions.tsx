"use client";

import { Priority, Role, TicketStatus, Trade } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PRIORITIES, PRIORITY_LABEL, STATUS_LABEL } from "@/lib/labels";
import { SLA_HOURS } from "@/lib/sla";
import { nextActions } from "@/lib/status";
import { TRADE_LABEL } from "@/lib/trades";

type Worker = { id: string; name: string; openJobs: number; trade?: Trade | null };

const CLOCK_STOPPED: TicketStatus[] = ["RESOLVED", "CLOSED", "REJECTED"];

export function TicketActions({
  ticketId,
  status,
  priority,
  role,
  isAssignee,
  isReporter,
  canAssignRole,
  workers,
  assigneeId,
}: {
  ticketId: string;
  status: TicketStatus;
  priority: Priority;
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
  const [rating, setRating] = useState("");
  const actions = nextActions(status, { role, isAssignee, isReporter });
  const needsRating = role === "STUDENT" && status === "RESOLVED";
  const needsPart = actions.includes("WAITING_PARTS");

  async function setStatus(next: TicketStatus) {
    setError("");
    if (needsRating && next === "CLOSED" && !rating) {
      setError("Rate the fix from 1 to 5 before you close it.");
      return;
    }
    if (next === "WAITING_PARTS" && note.trim().length < 4) {
      setError("Say which part you are waiting on.");
      return;
    }
    const res = await fetch(`/api/tickets/${ticketId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: next,
        note: note || undefined,
        rating: rating ? Number(rating) : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not update.");
      return;
    }
    setNote("");
    setRating("");
    router.refresh();
  }

  async function changePriority(next: string, select: HTMLSelectElement) {
    setError("");
    const res = await fetch(`/api/tickets/${ticketId}/priority`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: next }),
    });
    const data = await res.json();
    if (!res.ok) {
      select.value = priority;
      setError(data.error ?? "Could not change priority.");
      return;
    }
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
      {canAssignRole && !CLOCK_STOPPED.includes(status) ? (
        <label className="block text-sm">
          Priority
          <select
            defaultValue={priority}
            onChange={(e) => changePriority(e.target.value, e.target)}
            className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
          >
            {PRIORITIES.map((level) => (
              <option key={level} value={level}>
                {PRIORITY_LABEL[level]} · {SLA_HOURS[level]}h
              </option>
            ))}
          </select>
        </label>
      ) : null}
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
                {w.trade ? ` · ${TRADE_LABEL[w.trade]}` : ""} · {w.openJobs} open
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {needsRating ? (
        <label className="block text-sm">
          How was the fix?
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
          >
            <option value="">Pick 1 to 5</option>
            <option value="5">5 — sorted</option>
            <option value="4">4 — fine</option>
            <option value="3">3 — okay</option>
            <option value="2">2 — still off</option>
            <option value="1">1 — not fixed</option>
          </select>
        </label>
      ) : null}
      {actions.length ? (
        <label className="block text-sm">
          {needsPart ? "Which part?" : "Note (optional)"}
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
            placeholder={
              needsPart ? "Capacitor for the fan, ordered" : needsRating ? "Tap still drips a little…" : "Visited the room"
            }
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
            {role === "STUDENT" && status === "OPEN" && action === "CLOSED"
              ? "Take it back"
              : `Mark ${STATUS_LABEL[action].toLowerCase()}`}
          </button>
        ))}
        {!actions.length ? <p className="text-sm text-ink/45">No status moves from here for your role.</p> : null}
      </div>
      {error ? <p className="text-sm text-rust">{error}</p> : null}
    </div>
  );
}

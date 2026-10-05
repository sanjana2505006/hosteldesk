"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, CATEGORY_LABEL, PRIORITIES, PRIORITY_LABEL } from "@/lib/labels";

export function TicketForm({
  defaultRoom,
  lockRoom,
}: {
  defaultRoom?: string | null;
  lockRoom?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [existingId, setExistingId] = useState("");
  const [pending, setPending] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  async function upload(file: File) {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    setPhotoUrl(data.url);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setExistingId("");
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      category: form.get("category"),
      priority: form.get("priority"),
      roomNumber: form.get("roomNumber"),
      photoUrl: photoUrl || undefined,
    };
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Could not file the ticket.");
      setExistingId(typeof data.ticketId === "string" ? data.ticketId : "");
      return;
    }
    router.push(`/tickets/${data.ticket.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        What’s broken?
        <input name="title" required minLength={4} placeholder="Tap leaking in the washbasin" className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2" />
      </label>
      <label className="block text-sm">
        Details the worker needs
        <textarea name="description" required minLength={10} rows={5} className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2" />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          Category
          <select name="category" className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Priority
          <select name="priority" defaultValue="MEDIUM" className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2">
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Room
          <input
            name="roomNumber"
            defaultValue={defaultRoom ?? ""}
            readOnly={lockRoom}
            required
            className={`mt-1 w-full rounded-md border border-line px-3 py-2 ${lockRoom ? "bg-black/5 text-ink/70" : "bg-white"}`}
          />
          {lockRoom ? <span className="mt-1 block text-ink/50">Only your own room.</span> : null}
        </label>
      </div>
      <label className="block text-sm">
        Photo (optional, under 2 MB)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-1 block w-full text-sm"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              await upload(file);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload failed");
            }
          }}
        />
        {photoUrl ? <p className="mt-1 text-xs text-moss">Photo attached.</p> : null}
      </label>
      {error ? <p className="text-sm text-rust">{error}</p> : null}
      {existingId ? (
        <Link href={`/tickets/${existingId}`} className="text-sm text-forest">
          Open the existing ticket
        </Link>
      ) : null}
      <button
        disabled={pending}
        className="rounded-md bg-rust px-4 py-2.5 text-sm font-medium text-white hover:bg-[#a33d14] disabled:opacity-60"
      >
        {pending ? "Filing…" : "File complaint"}
      </button>
    </form>
  );
}

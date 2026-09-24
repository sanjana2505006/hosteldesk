"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CommentForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not post.");
      return;
    }
    setMessage("");
    setError("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={3}
        placeholder="Add an update the other side will see…"
        className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
      />
      {error ? <p className="text-sm text-rust">{error}</p> : null}
      <button className="rounded-md bg-forest px-3 py-2 text-sm text-paper">Post update</button>
    </form>
  );
}

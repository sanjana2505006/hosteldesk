"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NoticeForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch("/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not post.");
      return;
    }
    setTitle("");
    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-line bg-panel p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Post a notice</p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        minLength={4}
        placeholder="Water off on Sunday morning"
        className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        minLength={8}
        rows={3}
        placeholder="Who it affects, and until when."
        className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
      />
      {error ? <p className="text-sm text-rust">{error}</p> : null}
      <button className="rounded-md bg-forest px-3 py-2 text-sm text-paper">Post notice</button>
    </form>
  );
}

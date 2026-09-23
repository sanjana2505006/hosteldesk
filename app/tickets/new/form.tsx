"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewTicketForm({ defaultRoom }: { defaultRoom: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        category: form.get("category"),
        priority: form.get("priority"),
        roomNo: form.get("roomNo"),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "could not file complaint");
      return;
    }

    router.push("/tickets");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <input name="title" placeholder="what's broken?" required className="w-full rounded border px-3 py-2" />
      <textarea
        name="description"
        placeholder="a bit more detail"
        required
        rows={4}
        className="w-full rounded border px-3 py-2"
      />
      <select name="category" className="w-full rounded border px-3 py-2">
        <option value="plumbing">plumbing</option>
        <option value="electrical">electrical</option>
        <option value="wifi">wifi</option>
        <option value="furniture">furniture</option>
        <option value="other">other</option>
      </select>
      <select name="priority" defaultValue="MEDIUM" className="w-full rounded border px-3 py-2">
        <option value="LOW">low</option>
        <option value="MEDIUM">medium</option>
        <option value="HIGH">high</option>
      </select>
      <input name="roomNo" defaultValue={defaultRoom} placeholder="room no" required className="w-full rounded border px-3 py-2" />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button disabled={loading} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
        {loading ? "filing..." : "file complaint"}
      </button>
      <p className="text-sm">
        <Link href="/tickets" className="underline">
          back to my complaints
        </Link>
      </p>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TRADE_LABEL, TRADES } from "@/lib/trades";

type Hostel = { id: string; name: string; block: string };

export function WorkerForm({ hostels }: { hostels?: Hostel[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [pending, setPending] = useState(false);
  const pickHostel = Boolean(hostels?.length);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setDone("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const res = await fetch("/api/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Could not add the worker.");
      return;
    }
    form.reset();
    setDone("Added. They can sign in with that email.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm">
        Name
        <input name="name" required minLength={2} className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5 text-base" />
      </label>
      <label className="block text-sm">
        Email
        <input name="email" type="email" required className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5 text-base" />
      </label>
      <label className="block text-sm">
        Password
        <input name="password" type="password" required minLength={6} className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5 text-base" />
      </label>
      <label className="block text-sm">
        Trade
        <select name="trade" required className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5 text-base">
          {TRADES.map((trade) => (
            <option key={trade} value={trade}>
              {TRADE_LABEL[trade]}
            </option>
          ))}
        </select>
      </label>
      {pickHostel ? (
        <label className="block text-sm sm:col-span-2">
          Hostel
          <select name="hostelId" required className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5 text-base">
            {hostels!.map((hostel) => (
              <option key={hostel.id} value={hostel.id}>
                {hostel.name} · {hostel.block}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {error ? <p className="text-sm text-rust sm:col-span-2">{error}</p> : null}
      {done ? <p className="text-sm text-moss sm:col-span-2">{done}</p> : null}
      <button
        disabled={pending}
        className="w-full rounded-full bg-forest px-4 py-2.5 text-base text-white hover:bg-forest-600 disabled:opacity-60 sm:col-span-2 sm:w-auto"
      >
        {pending ? "Adding…" : "Add worker"}
      </button>
    </form>
  );
}

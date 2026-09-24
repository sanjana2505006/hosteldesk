"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Hostel = { id: string; name: string; block: string };

export function RegisterForm({ hostels }: { hostels: Hostel[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setPending(false);
      setError(data.error ?? "Could not create account.");
      return;
    }
    const signed = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    setPending(false);
    if (signed?.error) {
      router.push("/login");
      return;
    }
    router.push("/inbox");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        Full name
        <input name="name" required className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2" />
      </label>
      <label className="block text-sm">
        College email
        <input name="email" type="email" required className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2" />
      </label>
      <label className="block text-sm">
        Password
        <input name="password" type="password" minLength={6} required className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2" />
      </label>
      <label className="block text-sm">
        Hostel
        <select name="hostelId" required className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2">
          {hostels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} · {h.block}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Room
        <input name="roomNumber" placeholder="A-214" required className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2" />
      </label>
      {error ? <p className="text-sm text-rust">{error}</p> : null}
      <button
        disabled={pending}
        className="w-full rounded-md bg-forest px-4 py-2.5 text-sm font-medium text-paper hover:bg-forest-600 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create student account"}
      </button>
    </form>
  );
}

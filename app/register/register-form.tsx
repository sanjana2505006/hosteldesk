"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Hostel = { id: string; name: string; block: string };

export function RegisterForm({ hostels }: { hostels: Hostel[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      hostelId: form.get("hostelId"),
      roomNo: form.get("roomNo"),
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "could not register");
      return;
    }

    const signed = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    setLoading(false);

    if (signed?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <input name="name" placeholder="full name" required className="w-full rounded border px-3 py-2" />
      <input name="email" type="email" placeholder="college email" required className="w-full rounded border px-3 py-2" />
      <input name="password" type="password" placeholder="password" minLength={6} required className="w-full rounded border px-3 py-2" />
      <select name="hostelId" required className="w-full rounded border px-3 py-2">
        {hostels.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name} - Block {h.block}
          </option>
        ))}
      </select>
      <input name="roomNo" placeholder="room no (A-214)" required className="w-full rounded border px-3 py-2" />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button disabled={loading} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
        {loading ? "creating..." : "create account"}
      </button>
      <p className="text-sm text-gray-600">
        already have an account? <Link href="/login" className="underline">login</Link>
      </p>
    </form>
  );
}

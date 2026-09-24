"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const demos = [
  { label: "Student", email: "student@hosteldesk.dev", password: "student123" },
  { label: "Warden", email: "warden@hosteldesk.dev", password: "warden123" },
  { label: "Worker", email: "worker@hosteldesk.dev", password: "worker123" },
  { label: "Admin", email: "admin@hosteldesk.dev", password: "admin123" },
];

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setPending(false);
    if (result?.error) {
      setError("Wrong email or password.");
      return;
    }
    router.push("/inbox");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {demos.map((demo) => (
          <button
            key={demo.email}
            type="button"
            onClick={() => {
              setEmail(demo.email);
              setPassword(demo.password);
            }}
            className="stamp border-forest/30 text-forest hover:bg-forest/10"
          >
            {demo.label}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          Email
          <input
            className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 outline-none ring-forest/20 focus:ring-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 outline-none ring-forest/20 focus:ring-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? <p className="text-sm text-rust">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-forest px-4 py-2.5 text-sm font-medium text-paper hover:bg-forest-600 disabled:opacity-60"
        >
          {pending ? "Opening desk…" : "Enter the desk"}
        </button>
      </form>
    </div>
  );
}

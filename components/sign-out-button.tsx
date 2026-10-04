"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md px-3 py-1.5 text-sm text-ink/60 hover:bg-ink/5 hover:text-ink"
    >
      Sign out
    </button>
  );
}

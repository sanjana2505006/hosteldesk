"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-xs uppercase tracking-[0.14em] text-paper/70 hover:text-paper"
    >
      Sign out
    </button>
  );
}

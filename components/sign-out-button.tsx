"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-[12px] text-ink/80 transition-colors duration-200 hover:text-ink"
    >
      Sign out
    </button>
  );
}

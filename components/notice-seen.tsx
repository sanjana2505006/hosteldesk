"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NoticeSeen({ noticeId }: { noticeId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onClick() {
    setError("");
    const res = await fetch(`/api/notices/${noticeId}/seen`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not mark it.");
      return;
    }
    router.refresh();
  }

  return (
    <span>
      <button
        type="button"
        onClick={onClick}
        className="rounded-md border border-forest/30 px-2 py-1 text-xs text-forest hover:bg-forest/10"
      >
        Got it
      </button>
      {error ? <span className="ml-2 text-xs text-rust">{error}</span> : null}
    </span>
  );
}

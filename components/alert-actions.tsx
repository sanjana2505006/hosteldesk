"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ClearTicketAlerts({ ticketId }: { ticketId: string }) {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/alerts/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId }),
    }).then(async (res) => {
      if (!res.ok) return;
      const data = await res.json();
      if (data.updated) router.refresh();
    });
  }, [ticketId, router]);

  return null;
}

export function MarkAlertsRead() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    await fetch("/api/alerts/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="rounded-md border border-line bg-white px-3 py-1.5 text-sm text-ink/70 hover:bg-[#fbf6ec]"
    >
      {pending ? "Clearing…" : "Mark all read"}
    </button>
  );
}

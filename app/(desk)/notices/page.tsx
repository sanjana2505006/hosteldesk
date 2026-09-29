import { redirect } from "next/navigation";
import { NoticeForm } from "@/components/notice-form";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Notice = {
  _id: string;
  title: string;
  body: string;
  hostelLabel: string;
  authorName: string;
  createdAt: string;
};

async function loadNotices(role: string, hostelId: string | null | undefined) {
  const api = process.env.EXPRESS_URL;
  const key = process.env.DESK_API_KEY;
  if (!api || !key) return { notices: [] as Notice[], down: true };

  const url = new URL("/notices", api);
  if (role === "ADMIN") url.searchParams.set("all", "1");
  else if (hostelId) url.searchParams.set("hostelId", hostelId);

  const res = await fetch(url, {
    headers: { "x-desk-key": key },
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) return { notices: [] as Notice[], down: true };
  const data = await res.json();
  return { notices: (data.notices ?? []) as Notice[], down: false };
}

export default async function NoticesPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const staff = user.role === "WARDEN" || user.role === "ADMIN";
  const { notices, down } = await loadNotices(user.role, user.hostelId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl text-ink">Notice board</h1>
        <p className="mt-1 text-sm text-ink/55">Water cuts, Wi-Fi work, anything that is not a room ticket.</p>
      </div>

      {staff ? <NoticeForm /> : null}

      {down ? (
        <p className="rounded-lg border border-line bg-panel px-4 py-6 text-sm text-ink/60">
          Notice API is not running. Start Mongo, then <span className="font-mono">npm run server</span>.
        </p>
      ) : notices.length ? (
        <div className="space-y-3">
          {notices.map((notice) => (
            <article key={notice._id} className="rounded-lg border border-line bg-panel p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-forest">{notice.hostelLabel}</p>
              <h2 className="mt-1 text-lg text-ink">{notice.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">{notice.body}</p>
              <p className="mt-3 text-[11px] text-ink/40">
                {notice.authorName} · {formatDate(notice.createdAt)}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink/50">Nothing on the board yet.</p>
      )}
    </div>
  );
}

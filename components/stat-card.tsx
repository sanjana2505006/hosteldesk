export function StatCard({
  label,
  value,
  hint,
  alert,
}: {
  label: string;
  value: number | string;
  hint?: string;
  alert?: boolean;
}) {
  return (
    <div className={`rounded-lg border bg-panel p-4 shadow-desk ${alert ? "border-rust/40" : "border-line"}`}>
      <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">{label}</p>
      <p className={`mt-2 font-serif text-3xl ${alert ? "text-rust" : "text-ink"}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink/45">{hint}</p> : null}
    </div>
  );
}

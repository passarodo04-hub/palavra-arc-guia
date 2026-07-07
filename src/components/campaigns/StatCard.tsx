import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-soft ${
        accent ? "border-gold/40 bg-gold/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Icon className="size-3.5 text-gold" />
        {label}
      </div>
      <div className="mt-2 font-serif text-xl text-foreground">{value}</div>
    </div>
  );
}
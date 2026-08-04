import type { ResolvedUnlockable } from "@/lib/walk";

export function UnlockableTile({
  item,
  onSelect,
}: {
  item: ResolvedUnlockable;
  onSelect: (item: ResolvedUnlockable) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-label={`${item.name} — ${item.unlocked ? "desbloqueado" : "bloqueado"}`}
      className={`flex min-h-[7.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
        item.unlocked
          ? "border-gold/50 bg-gold/10 shadow-soft hover:border-gold"
          : "border-dashed border-border bg-secondary/40 hover:border-muted-foreground/40"
      }`}
    >
      <span
        aria-hidden
        className={`text-2xl ${item.unlocked ? "" : "opacity-40 grayscale"}`}
      >
        {item.unlocked ? item.emoji : "🔒"}
      </span>
      <span
        className={`text-xs font-medium leading-tight ${
          item.unlocked ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {item.name}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {item.unlocked ? "✅" : "🔒"}
      </span>
    </button>
  );
}
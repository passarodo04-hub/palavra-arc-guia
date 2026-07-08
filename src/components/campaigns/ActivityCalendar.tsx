import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Level = "full" | "partial" | undefined;

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ActivityCalendar({ map }: { map: Map<string, "full" | "partial"> }) {
  const [ref, setRef] = useState<{ y: number; m: number }>(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const { cells, monthLabel } = useMemo(() => {
    const first = new Date(ref.y, ref.m, 1);
    const startOffset = first.getDay(); // 0 = Sunday
    const daysInMonth = new Date(ref.y, ref.m + 1, 0).getDate();
    const todayISO = toISO(new Date());
    const cells: { date?: string; level: Level; isToday: boolean }[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ level: undefined, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toISO(new Date(ref.y, ref.m, d));
      cells.push({ date: iso, level: map.get(iso), isToday: iso === todayISO });
    }
    const monthLabel = new Date(ref.y, ref.m, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return { cells, monthLabel };
  }, [ref, map]);

  const prev = () => setRef(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }));
  const next = () => setRef(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }));
  const canNext = ref.y < new Date().getFullYear() || (ref.y === new Date().getFullYear() && ref.m < new Date().getMonth());

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <button type="button" onClick={prev} aria-label="Mês anterior" className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
          <ChevronLeft className="size-4" />
        </button>
        <div className="font-serif text-base capitalize text-foreground">{monthLabel}</div>
        <button
          type="button"
          onClick={next}
          disabled={!canNext}
          aria-label="Próximo mês"
          className="rounded-full p-2 text-muted-foreground hover:bg-secondary disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((c, i) => (
          <div
            key={i}
            title={c.date}
            className={`aspect-square rounded-md ${
              !c.date
                ? ""
                : c.level === "full"
                  ? "bg-emerald-500/70"
                  : c.level === "partial"
                    ? "bg-amber-400/70"
                    : "bg-secondary"
            } ${c.isToday ? "ring-2 ring-gold" : ""}`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-3 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="size-3 rounded-sm bg-secondary" /> Sem registro</span>
        <span className="inline-flex items-center gap-1"><span className="size-3 rounded-sm bg-amber-400/70" /> Parcial</span>
        <span className="inline-flex items-center gap-1"><span className="size-3 rounded-sm bg-emerald-500/70" /> Completo</span>
      </div>
    </div>
  );
}
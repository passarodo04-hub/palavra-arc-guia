import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TrackCard, type TrackState } from "./TrackCard";
import type { Track } from "@/lib/journey-catalog";

export function TrackRail({
  title,
  icon,
  items,
  action,
  size = "md",
}: {
  title: string;
  icon?: ReactNode;
  items: { track: Track; progress?: TrackState }[];
  action?: ReactNode;
  size?: "md" | "lg";
}) {
  const ref = useRef<HTMLUListElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };
  if (items.length === 0) return null;

  return (
    <section className="animate-fade-up">
      <div className="flex items-center justify-between gap-2 px-2">
        <h2 className="flex min-w-0 items-center gap-2 font-serif text-xl text-foreground sm:text-2xl">
          {icon}
          <span className="truncate">{title}</span>
        </h2>
        <div className="flex shrink-0 items-center gap-1">
          {action}
          <div className="hidden items-center gap-1 md:flex">
            <button
              type="button"
              aria-label={`Rolar ${title} para a esquerda`}
              onClick={() => scrollBy(-1)}
              className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label={`Rolar ${title} para a direita`}
              onClick={() => scrollBy(1)}
              className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="relative -mx-4 mt-4">
        <ul
          ref={ref}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 scrollbar-none"
          style={{ scrollPaddingLeft: "1rem", touchAction: "pan-x pan-y" }}
        >
          {items.map(({ track, progress }) => (
            <li key={track.id} className={`shrink-0 snap-start ${size === "lg" ? "w-64 sm:w-72" : "w-56 sm:w-64"}`}>
              <TrackCard track={track} progress={progress} size={size} />
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}

import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { JourneyArt } from "./JourneyArt";
import { LEVEL_CLASSES, type Track } from "@/lib/journey-catalog";

export type TrackState = { percent: number; detail: string; started: boolean; completed: boolean };

export function TrackCard({
  track,
  progress,
  size = "md",
}: {
  track: Track;
  progress?: TrackState;
  size?: "md" | "lg";
}) {
  const started = progress?.started ?? false;
  return (
    <Link
      to={track.route}
      aria-label={`${started ? "Continuar" : "Começar"} ${track.title}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative">
        <JourneyArt theme={track.theme} className={size === "lg" ? "h-36" : "h-28"} />
        <span
          className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${LEVEL_CLASSES[track.level]}`}
        >
          {track.level}
        </span>
        {progress?.completed && (
          <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-hero-foreground backdrop-blur">
            Concluída
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-base text-card-foreground">{track.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{track.description}</p>

        {started && progress && progress.percent > 0 && (
          <div className="mt-3">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={progress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progresso de ${track.title}`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-primary"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="mt-1.5 text-[11px] text-muted-foreground">{progress.detail}</div>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-[11px] text-muted-foreground">{track.duration}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold">
            {started ? "Continuar" : "Começar"}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </span>
        </div>
      </div>
    </Link>
  );
}

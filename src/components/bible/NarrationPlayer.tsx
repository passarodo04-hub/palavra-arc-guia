import { useState } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Square,
  Volume2,
  VolumeX,
  Gauge,
} from "lucide-react";
import { NARRATION_SPEEDS, type NarrationState } from "@/lib/narration/types";

function fmt(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function NarrationPlayer({
  state,
  totalSeconds,
  resumeVerse,
  onToggle,
  onStop,
  onSeekRelative,
  onRate,
  onVolume,
}: {
  state: NarrationState;
  totalSeconds: number;
  resumeVerse: number | null;
  onToggle: () => void;
  onStop: () => void;
  onSeekRelative: (seconds: number) => void;
  onRate: (rate: number) => void;
  onVolume: (volume: number) => void;
}) {
  const [showSpeed, setShowSpeed] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const playing = state.status === "playing";
  const active = playing || state.status === "paused";
  const progress = totalSeconds > 0 ? Math.min(100, (state.positionSeconds / totalSeconds) * 100) : 0;

  if (state.status === "unsupported") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
        Narração indisponível neste dispositivo.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card/90 backdrop-blur px-3 py-2.5 shadow-soft">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label={playing ? "Pausar narração" : "Ouvir capítulo"}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            playing
              ? "bg-gold text-gold-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          <span className="whitespace-nowrap">
            {playing ? "Pausar" : active ? "Continuar" : "Ouvir capítulo"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSeekRelative(-10)}
          aria-label="Voltar 10 segundos"
          className="size-9 shrink-0 rounded-full bg-secondary text-foreground inline-flex items-center justify-center hover:bg-secondary/80"
        >
          <RotateCcw className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onSeekRelative(10)}
          aria-label="Avançar 10 segundos"
          className="size-9 shrink-0 rounded-full bg-secondary text-foreground inline-flex items-center justify-center hover:bg-secondary/80"
        >
          <RotateCw className="size-4" />
        </button>

        <div className="relative ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setShowVolume((v) => !v);
              setShowSpeed(false);
            }}
            aria-label="Volume da narração"
            aria-expanded={showVolume}
            className="size-9 rounded-full bg-secondary text-foreground inline-flex items-center justify-center hover:bg-secondary/80"
          >
            {state.volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowSpeed((v) => !v);
              setShowVolume(false);
            }}
            aria-label="Velocidade da narração"
            aria-expanded={showSpeed}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80"
          >
            <Gauge className="size-3.5" />
            {state.rate}x
          </button>
          {active && (
            <button
              type="button"
              onClick={onStop}
              aria-label="Parar narração"
              className="size-9 rounded-full bg-secondary text-foreground inline-flex items-center justify-center hover:bg-secondary/80"
            >
              <Square className="size-3.5" />
            </button>
          )}

          {showSpeed && (
            <div
              role="listbox"
              aria-label="Velocidades"
              className="absolute bottom-full right-0 z-50 mb-2 w-28 rounded-2xl border border-border bg-card p-1.5 shadow-soft"
            >
              {NARRATION_SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="option"
                  aria-selected={state.rate === s}
                  onClick={() => {
                    onRate(s);
                    setShowSpeed(false);
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                    state.rate === s
                      ? "bg-gold/15 font-semibold text-gold"
                      : "text-card-foreground hover:bg-secondary"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}

          {showVolume && (
            <div className="absolute bottom-full right-0 z-50 mb-2 w-44 rounded-2xl border border-border bg-card p-3 shadow-soft">
              <label className="text-xs text-muted-foreground" htmlFor="narration-volume">
                Volume
              </label>
              <input
                id="narration-volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={state.volume}
                onChange={(e) => onVolume(Number(e.target.value))}
                className="mt-2 w-full accent-[hsl(var(--gold,45_80%_50%))]"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {fmt(state.positionSeconds)} / {fmt(totalSeconds)}
        </span>
      </div>

      <p className="mt-1 text-[10px] text-muted-foreground">
        {state.currentVerse != null
          ? `Narrando versículo ${state.currentVerse}`
          : resumeVerse
            ? `Continuar do versículo ${resumeVerse}`
            : "Narração por voz do dispositivo (prévia)"}
      </p>
    </div>
  );
}

import { useState } from "react";
import { Music2, Pause, Play, X, Volume2 } from "lucide-react";
import { AMBIENTS, useAmbientAudio, type AmbientId } from "@/lib/ambient-audio";

/** Player discreto de áudio ambiente. Começa desligado e só toca depois de
 *  uma interação explícita do usuário. Nunca bloqueia a leitura. */
export function AmbientPlayer() {
  const { ambient, playing, volume, error, setAmbient, toggle, setVolume } = useAmbientAudio();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Fechar áudio ambiente" : "Abrir áudio ambiente"}
        className="fixed bottom-24 right-4 z-40 inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-elegant transition-transform hover:scale-105"
      >
        {open ? <X className="size-5" /> : <Music2 className={`size-5 ${playing ? "text-gold" : ""}`} />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Áudio ambiente"
          className="fixed bottom-40 right-4 z-40 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-4 shadow-elegant animate-fade-up"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-card-foreground">Áudio ambiente</h2>
            <button
              type="button"
              onClick={toggle}
              disabled={ambient === "mudo"}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground disabled:opacity-50"
            >
              {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              {playing ? "Pausar" : "Tocar"}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {AMBIENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAmbient(a.id as AmbientId)}
                aria-pressed={ambient === a.id}
                className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                  ambient === a.id
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border bg-secondary text-secondary-foreground hover:border-gold/40"
                }`}
              >
                <span aria-hidden="true">{a.emoji}</span> {a.label}
              </button>
            ))}
          </div>

          <label className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Volume2 className="size-4" />
            <span className="sr-only">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-[var(--gold,currentColor)]"
            />
          </label>

          {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Sons gerados no próprio aparelho, sem download e sem música protegida por direitos autorais.
          </p>
        </div>
      )}
    </>
  );
}

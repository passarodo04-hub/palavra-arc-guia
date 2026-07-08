import { useEffect, useRef, useState } from "react";
import { Play, Square, Volume2 } from "lucide-react";

type SoundId = "rain" | "forest" | "piano" | "ocean" | "silence";

const SOUNDS: { id: SoundId; label: string; emoji: string }[] = [
  { id: "rain", label: "Chuva", emoji: "🌧️" },
  { id: "forest", label: "Floresta", emoji: "🌳" },
  { id: "piano", label: "Piano suave", emoji: "🎹" },
  { id: "ocean", label: "Oceano", emoji: "🌊" },
  { id: "silence", label: "Silêncio", emoji: "🤫" },
];

/**
 * Optional ambient sound generator built on Web Audio.
 * - Never autoplays.
 * - No external audio files (all synthesized).
 * - Cleans up on unmount.
 */
export function AmbientSounds() {
  const [active, setActive] = useState<SoundId | null>(null);
  const [volume, setVolume] = useState(0.3);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => () => stopAll(), []);

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }, [volume]);

  function ensureCtx() {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
      gainRef.current = ctxRef.current.createGain();
      gainRef.current.gain.value = volume;
      gainRef.current.connect(ctxRef.current.destination);
    }
    return { ctx: ctxRef.current!, gain: gainRef.current! };
  }

  function makeNoiseBuffer(ctx: AudioContext) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    return buffer;
  }

  function stopAll() {
    try {
      nodesRef.current?.stop();
    } catch {}
    nodesRef.current = null;
  }

  function play(id: SoundId) {
    if (id === "silence" || active === id) {
      stopAll();
      setActive(id === "silence" ? null : null);
      return;
    }
    stopAll();
    const { ctx, gain } = ensureCtx();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    if (id === "piano") {
      const notes = [261.63, 329.63, 392.0, 523.25];
      const oscs: OscillatorNode[] = [];
      const gains: GainNode[] = [];
      const step = () => {
        const now = ctx.currentTime;
        for (const n of notes) {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.value = n;
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.15, now + 0.2);
          g.gain.linearRampToValueAtTime(0, now + 3);
          o.connect(g).connect(gain);
          o.start(now);
          o.stop(now + 3.2);
          oscs.push(o);
          gains.push(g);
        }
      };
      step();
      const timer = window.setInterval(step, 4000);
      nodesRef.current = {
        stop: () => {
          window.clearInterval(timer);
          oscs.forEach((o) => {
            try {
              o.stop();
            } catch {}
          });
        },
      };
    } else {
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx);
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      if (id === "rain") filter.frequency.value = 1800;
      else if (id === "forest") filter.frequency.value = 1000;
      else filter.frequency.value = 400; // ocean
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = id === "ocean" ? 0.15 : 0.6;
      lfoGain.gain.value = id === "ocean" ? 0.35 : 0.1;
      lfo.connect(lfoGain).connect(gain.gain);
      src.connect(filter).connect(gain);
      src.start();
      lfo.start();
      nodesRef.current = {
        stop: () => {
          try { src.stop(); } catch {}
          try { lfo.stop(); } catch {}
        },
      };
    }
    setActive(id);
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Ambiente sonoro</div>
          <p className="mt-1 text-xs text-muted-foreground">Sons opcionais para acompanhar sua oração. Nunca inicia sozinho.</p>
        </div>
        {active && (
          <button
            type="button"
            onClick={() => { stopAll(); setActive(null); }}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-gold/40"
          >
            <Square className="size-3.5" /> Parar
          </button>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {SOUNDS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => play(s.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              active === s.id ? "border-gold bg-gold/10 text-foreground" : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/40"
            }`}
          >
            <span>{s.emoji}</span>
            {active === s.id ? <Play className="size-3.5 text-gold" /> : null}
            {s.label}
          </button>
        ))}
      </div>
      <label className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <Volume2 className="size-4" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 accent-[hsl(var(--gold))]"
          aria-label="Volume"
        />
      </label>
    </section>
  );
}
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/* Áudio ambiente sintetizado na hora (Web Audio API): nada é baixado,
 * nada é pré-carregado e nada toca sem o usuário pedir. Padrão: mudo. */

export type AmbientId = "mudo" | "chuva" | "rio" | "passaros" | "floresta" | "piano" | "adoracao" | "pads";

export const AMBIENTS: { id: AmbientId; label: string; emoji: string }[] = [
  { id: "mudo", label: "Mudo", emoji: "🔇" },
  { id: "pads", label: "Pads de adoração", emoji: "🕊️" },
  { id: "chuva", label: "Chuva", emoji: "🌧️" },
  { id: "rio", label: "Rio", emoji: "🌊" },
  { id: "passaros", label: "Pássaros", emoji: "🐦" },
  { id: "floresta", label: "Floresta", emoji: "🌲" },
  { id: "piano", label: "Piano", emoji: "🎹" },
  { id: "adoracao", label: "Adoração instrumental", emoji: "🎻" },
];

const PREF_KEY = "palavra-plus:ambient";

type Ctx = {
  ambient: AmbientId;
  playing: boolean;
  volume: number;
  error: string | null;
  setAmbient: (id: AmbientId) => void;
  toggle: () => void;
  setVolume: (v: number) => void;
  stop: () => void;
};

const AmbientContext = createContext<Ctx>({
  ambient: "mudo",
  playing: false,
  volume: 0.4,
  error: null,
  setAmbient: () => {},
  toggle: () => {},
  setVolume: () => {},
  stop: () => {},
});

function noiseBuffer(ctx: AudioContext) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

type Graph = { stop: () => void };

function buildGraph(ctx: AudioContext, out: GainNode, id: AmbientId): Graph {
  const disposers: (() => void)[] = [];

  const startNoise = (type: BiquadFilterType, freq: number, q: number, gain: number) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(filter).connect(g).connect(out);
    src.start();
    disposers.push(() => {
      try {
        src.stop();
      } catch {}
      src.disconnect();
      g.disconnect();
      filter.disconnect();
    });
  };

  const startTones = (notes: number[], every: number, dur: number, wave: OscillatorType) => {
    const timer = window.setInterval(() => {
      const f = notes[Math.floor(Math.random() * notes.length)];
      const osc = ctx.createOscillator();
      osc.type = wave;
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(g).connect(out);
      osc.start();
      osc.stop(ctx.currentTime + dur + 0.1);
    }, every);
    disposers.push(() => window.clearInterval(timer));
  };

  switch (id) {
    case "pads": {
      // Pad contemplativo: acorde sustentado, sem batida, sem melodia.
      const master = ctx.createGain();
      master.gain.value = 0.0001;
      master.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 3);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900;
      lp.Q.value = 0.4;
      master.connect(lp).connect(out);

      const freqs = [130.8, 196, 261.6, 329.6, 392];
      const oscs: OscillatorNode[] = [];
      freqs.forEach((f, i) => {
        [0, 1].forEach((d) => {
          const o = ctx.createOscillator();
          o.type = i % 2 === 0 ? "sine" : "triangle";
          o.frequency.value = f * (d ? 1.004 : 0.997);
          const g = ctx.createGain();
          g.gain.value = 0.12 / freqs.length;
          o.connect(g).connect(master);
          o.start();
          oscs.push(o);
        });
      });

      // Respiração lenta do filtro e do volume (sensação de oração).
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 260;
      lfo.connect(lfoGain).connect(lp.frequency);
      lfo.start();

      disposers.push(() => {
        try {
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
        } catch {}
        window.setTimeout(() => {
          oscs.forEach((o) => {
            try {
              o.stop();
            } catch {}
            o.disconnect();
          });
          try {
            lfo.stop();
          } catch {}
          lfo.disconnect();
          lfoGain.disconnect();
          lp.disconnect();
          master.disconnect();
        }, 900);
      });
      break;
    }
    case "chuva":
      startNoise("highpass", 900, 0.6, 0.28);
      startNoise("lowpass", 420, 0.5, 0.16);
      break;
    case "rio":
      startNoise("bandpass", 620, 0.9, 0.34);
      startNoise("lowpass", 260, 0.4, 0.2);
      break;
    case "passaros":
      startNoise("lowpass", 300, 0.3, 0.08);
      startTones([1720, 2050, 2380, 2760], 2400, 0.22, "sine");
      break;
    case "floresta":
      startNoise("bandpass", 480, 0.4, 0.2);
      startTones([1480, 1960, 2240], 4200, 0.18, "sine");
      break;
    case "piano":
      startTones([261.6, 329.6, 392, 440, 523.3], 2600, 2.4, "triangle");
      break;
    case "adoracao":
      startTones([196, 246.9, 293.7, 349.2, 392], 3400, 4.2, "sine");
      startNoise("lowpass", 180, 0.3, 0.05);
      break;
    default:
      break;
  }

  return { stop: () => disposers.forEach((d) => d()) };
}

export function AmbientAudioProvider({ children }: { children: React.ReactNode }) {
  const [ambient, setAmbientState] = useState<AmbientId>("mudo");
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.4);
  const [error, setError] = useState<string | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const graphRef = useRef<Graph | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREF_KEY);
      if (raw) {
        const pref = JSON.parse(raw) as { ambient?: AmbientId; volume?: number };
        if (pref.ambient) setAmbientState(pref.ambient);
        if (typeof pref.volume === "number") setVolumeState(pref.volume);
      }
    } catch {}
    return () => {
      graphRef.current?.stop();
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const persist = useCallback((next: { ambient: AmbientId; volume: number }) => {
    try {
      window.localStorage.setItem(PREF_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const stopGraph = useCallback(() => {
    graphRef.current?.stop();
    graphRef.current = null;
    setPlaying(false);
  }, []);

  const start = useCallback(
    (id: AmbientId, vol: number) => {
      if (id === "mudo") {
        stopGraph();
        return;
      }
      try {
        const AC: typeof AudioContext | undefined =
          window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) throw new Error("unsupported");
        if (!ctxRef.current) {
          ctxRef.current = new AC();
          gainRef.current = ctxRef.current.createGain();
          gainRef.current.connect(ctxRef.current.destination);
        }
        const ctx = ctxRef.current;
        const gain = gainRef.current!;
        gain.gain.value = vol;
        void ctx.resume();
        graphRef.current?.stop();
        graphRef.current = buildGraph(ctx, gain, id);
        setPlaying(true);
        setError(null);
      } catch {
        setPlaying(false);
        setError("Não foi possível reproduzir o áudio neste dispositivo. A leitura continua normalmente.");
      }
    },
    [stopGraph],
  );

  const setAmbient = useCallback(
    (id: AmbientId) => {
      setAmbientState(id);
      persist({ ambient: id, volume });
      if (id === "mudo") stopGraph();
      else start(id, volume);
    },
    [persist, start, stopGraph, volume],
  );

  const toggle = useCallback(() => {
    if (playing) stopGraph();
    else if (ambient !== "mudo") start(ambient, volume);
  }, [ambient, playing, start, stopGraph, volume]);

  const setVolume = useCallback(
    (v: number) => {
      setVolumeState(v);
      persist({ ambient, volume: v });
      if (gainRef.current) gainRef.current.gain.value = v;
    },
    [ambient, persist],
  );

  const value = useMemo(
    () => ({ ambient, playing, volume, error, setAmbient, toggle, setVolume, stop: stopGraph }),
    [ambient, playing, volume, error, setAmbient, toggle, setVolume, stopGraph],
  );

  return <AmbientContext.Provider value={value}>{children}</AmbientContext.Provider>;
}

export function useAmbientAudio() {
  return useContext(AmbientContext);
}
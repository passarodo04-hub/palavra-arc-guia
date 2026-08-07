import { artSeed } from "@/lib/atlas-shared";

/**
 * Representação artística gerada em SVG — leve (sem download de imagens),
 * consistente em toda a coleção e explicitamente ilustrativa: nunca uma
 * fotografia nem um retrato histórico real de personagens bíblicos.
 */
export function ArtPortrait({
  id,
  emoji,
  label,
  className = "",
  ratio = "16/9",
}: {
  id: string;
  emoji: string;
  label: string;
  className?: string;
  ratio?: string;
}) {
  const seed = artSeed(id);
  const hue = seed % 360;
  const hue2 = (hue + 42) % 360;
  const rings = 3 + (seed % 3);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-secondary ${className}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={`Ilustração artística representando ${label}. Imagem ilustrativa, não é uma fotografia.`}
    >
      <svg viewBox="0 0 320 180" className="size-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`oklch(0.55 0.11 ${hue})`} />
            <stop offset="100%" stopColor={`oklch(0.32 0.08 ${hue2})`} />
          </linearGradient>
        </defs>
        <rect width="320" height="180" fill={`url(#g-${id})`} />
        {Array.from({ length: rings }).map((_, i) => (
          <circle
            key={i}
            cx={40 + ((seed >> (i * 3)) % 240)}
            cy={30 + ((seed >> (i * 5)) % 120)}
            r={30 + i * 22}
            fill="none"
            stroke="white"
            strokeOpacity={0.12}
            strokeWidth="1.5"
          />
        ))}
        <path
          d={`M0 ${140 + (seed % 20)} Q 80 ${100 + (seed % 30)} 160 ${135 - (seed % 25)} T 320 ${120 + (seed % 20)} V180 H0 Z`}
          fill="white"
          fillOpacity="0.10"
        />
        <path
          d={`M0 ${160 - (seed % 12)} Q 90 ${130 + (seed % 20)} 180 ${155 - (seed % 15)} T 320 ${150} V180 H0 Z`}
          fill="black"
          fillOpacity="0.14"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="select-none text-5xl drop-shadow-lg" aria-hidden="true">
          {emoji}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2">
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/85">
          Ilustração artística
        </span>
      </div>
    </div>
  );
}
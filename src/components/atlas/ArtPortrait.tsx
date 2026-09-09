import { artSeed } from "@/lib/atlas-shared";
import { portraitFor } from "@/lib/character-portraits";

/**
 * Representação artística gerada em SVG — leve (sem download de imagens),
 * offline/PWA-friendly e explicitamente ilustrativa: nunca uma fotografia
 * nem um retrato histórico real de personagens bíblicos.
 *
 * A composição é determinística por `id`: paleta, cenário de fundo, formato
 * do manto, barba/cabelo e adorno de cabeça variam, de modo que cada rei,
 * juiz ou lugar tenha uma arte própria e reconhecível.
 */

function pick<T>(arr: T[], n: number): T {
  return arr[n % arr.length]!;
}

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
  const hue2 = (hue + 40 + (seed % 60)) % 360;
  const skin = `oklch(${0.62 + ((seed >> 3) % 12) / 100} 0.06 ${55 + ((seed >> 4) % 20)})`;
  const robe = `oklch(0.5 0.12 ${hue2})`;
  const robeDark = `oklch(0.36 0.10 ${hue2})`;
  const accent = `oklch(0.82 0.13 ${(hue + 200) % 360})`;

  const scene = (seed >> 2) % 4; // montanhas | cidade | tendas | templo
  const headwear = (seed >> 6) % 5; // coroa | turbante | elmo | faixa | nada
  const beard = (seed >> 9) % 4;
  const robePattern = (seed >> 11) % 3;
  const cx = 160;

  const uid = id.replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-secondary ${className}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={`Ilustração artística representando ${label}. Imagem ilustrativa, não é uma fotografia.`}
    >
      <svg viewBox="0 0 320 180" className="size-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`oklch(0.62 0.10 ${hue})`} />
            <stop offset="100%" stopColor={`oklch(0.30 0.07 ${hue2})`} />
          </linearGradient>
        </defs>

        <rect width="320" height="180" fill={`url(#sky-${uid})`} />

        {/* sol / lua */}
        <circle cx={40 + (seed % 240)} cy={30 + ((seed >> 5) % 40)} r={16 + (seed % 10)} fill={accent} fillOpacity="0.35" />

        {/* cenário */}
        {scene === 0 && (
          <g fill="black" fillOpacity="0.20">
            <path d={`M-10 150 L${60 + (seed % 40)} ${70 + (seed % 25)} L150 150 Z`} />
            <path d={`M120 150 L${210 + (seed % 40)} ${60 + (seed % 30)} L330 150 Z`} />
          </g>
        )}
        {scene === 1 && (
          <g fill="black" fillOpacity="0.22">
            {Array.from({ length: 7 }).map((_, i) => {
              const h = 30 + ((seed >> (i + 1)) % 55);
              return <rect key={i} x={10 + i * 45} y={150 - h} width="34" height={h} rx="3" />;
            })}
          </g>
        )}
        {scene === 2 && (
          <g fill="black" fillOpacity="0.22">
            {Array.from({ length: 5 }).map((_, i) => (
              <path key={i} d={`M${10 + i * 65} 150 L${42 + i * 65} ${100 + ((seed >> i) % 20)} L${74 + i * 65} 150 Z`} />
            ))}
          </g>
        )}
        {scene === 3 && (
          <g fill="black" fillOpacity="0.22">
            <rect x="90" y="80" width="140" height="70" rx="4" />
            <path d="M80 80 L160 45 L240 80 Z" />
            {[105, 135, 165, 195].map((x) => (
              <rect key={x} x={x} y="90" width="10" height="60" rx="3" fillOpacity="0.35" />
            ))}
          </g>
        )}

        {/* chão */}
        <path d="M0 148 Q 80 138 160 146 T 320 140 V180 H0 Z" fill="black" fillOpacity="0.28" />

        {/* figura estilizada */}
        <g>
          {/* manto */}
          <path d={`M${cx - 46} 180 Q ${cx - 40} 108 ${cx} 100 Q ${cx + 40} 108 ${cx + 46} 180 Z`} fill={robe} />
          <path d={`M${cx - 46} 180 Q ${cx - 18} 130 ${cx} 100 L${cx} 180 Z`} fill={robeDark} fillOpacity="0.55" />
          {robePattern === 1 && (
            <path d={`M${cx - 26} 180 L${cx - 10} 116 L${cx + 10} 116 L${cx + 26} 180 Z`} fill={accent} fillOpacity="0.45" />
          )}
          {robePattern === 2 && (
            <g stroke={accent} strokeOpacity="0.5" strokeWidth="2" fill="none">
              <path d={`M${cx - 34} 160 Q ${cx} 150 ${cx + 34} 160`} />
              <path d={`M${cx - 30} 172 Q ${cx} 162 ${cx + 30} 172`} />
            </g>
          )}
          {/* cabeça */}
          <circle cx={cx} cy={82} r="22" fill={skin} />
          {/* barba / cabelo */}
          {beard === 0 && <path d={`M${cx - 20} 86 Q ${cx} 124 ${cx + 20} 86 Q ${cx} 100 ${cx - 20} 86 Z`} fill={robeDark} />}
          {beard === 1 && <path d={`M${cx - 18} 88 Q ${cx} 112 ${cx + 18} 88 Z`} fill={robeDark} fillOpacity="0.85" />}
          {beard === 2 && (
            <path d={`M${cx - 22} 76 Q ${cx} 54 ${cx + 22} 76 Q ${cx} 66 ${cx - 22} 76 Z`} fill={robeDark} />
          )}
          {/* adorno de cabeça */}
          {headwear === 0 && (
            <path
              d={`M${cx - 24} 62 L${cx - 24} 46 L${cx - 12} 56 L${cx} 42 L${cx + 12} 56 L${cx + 24} 46 L${cx + 24} 62 Z`}
              fill={accent}
            />
          )}
          {headwear === 1 && <path d={`M${cx - 25} 66 Q ${cx} 40 ${cx + 25} 66 Q ${cx} 58 ${cx - 25} 66 Z`} fill={accent} fillOpacity="0.8" />}
          {headwear === 2 && (
            <g fill={accent} fillOpacity="0.9">
              <path d={`M${cx - 23} 70 Q ${cx} 44 ${cx + 23} 70 Z`} />
              <rect x={cx - 3} y="40" width="6" height="16" rx="3" />
            </g>
          )}
          {headwear === 3 && <rect x={cx - 24} y="62" width="48" height="7" rx="3" fill={accent} fillOpacity="0.85" />}
        </g>

        {/* moldura de luz */}
        <rect x="4" y="4" width="312" height="172" rx="14" fill="none" stroke="white" strokeOpacity="0.18" />
      </svg>

      <div className="absolute right-2 top-2 rounded-full bg-black/35 px-2 py-1 text-base backdrop-blur">
        <span aria-hidden="true">{emoji}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2">
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/85">
          Ilustração artística
        </span>
      </div>
    </div>
  );
}

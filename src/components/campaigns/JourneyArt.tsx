import type { ArtTheme } from "@/lib/journey-catalog";

/* Ilustrações vetoriais leves (sem download de imagens, sem fotos falsas).
 * Usam apenas tokens do design system, então funcionam em tema claro/escuro. */

const GRADIENTS: Record<ArtTheme, [string, string]> = {
  biblia: ["var(--hero-from)", "var(--hero-to)"],
  oracao: ["var(--primary)", "var(--gold)"],
  jejum: ["var(--gold)", "var(--hero-to)"],
  harpa: ["var(--hero-to)", "var(--gold)"],
  conhecimento: ["var(--primary)", "var(--hero-to)"],
  crescimento: ["var(--gold)", "var(--primary)"],
  familia: ["var(--hero-from)", "var(--gold)"],
  casais: ["var(--primary)", "var(--hero-from)"],
  criancas: ["var(--gold)", "var(--hero-from)"],
  desafios: ["var(--hero-to)", "var(--primary)"],
};

export const ART_ALT: Record<ArtTheme, string> = {
  biblia: "Ilustração de uma Bíblia aberta ao amanhecer",
  oracao: "Ilustração de mãos em oração sob a luz",
  jejum: "Ilustração de um ambiente contemplativo com uma lamparina",
  harpa: "Ilustração de um hinário com notas musicais",
  conhecimento: "Ilustração de um pergaminho e estrelas",
  crescimento: "Ilustração de uma pequena planta brotando",
  familia: "Ilustração de uma família reunida",
  casais: "Ilustração de duas alianças entrelaçadas",
  criancas: "Ilustração infantil com arca e arco-íris",
  desafios: "Ilustração de um caminho subindo a montanha",
};

function Scene({ theme }: { theme: ArtTheme }) {
  const s = "hsl(0 0% 100% / 0.85)";
  const f = "hsl(0 0% 100% / 0.22)";
  switch (theme) {
    case "biblia":
      return (
        <g stroke={s} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="150" cy="34" r="14" fill={f} stroke="none" />
          <path d="M20 78c22-12 44-12 60 0 16-12 38-12 60 0v16c-22-12-44-12-60 0-16-12-38-12-60 0z" fill={f} />
          <path d="M80 78V62M20 78c22-12 44-12 60 0 16-12 38-12 60 0" />
        </g>
      );
    case "oracao":
      return (
        <g stroke={s} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="150" cy="30" r="16" fill={f} stroke="none" />
          <path d="M62 96V56c0-8 6-14 13-14s13 6 13 14v40" fill={f} />
          <path d="M88 96V60c0-8 6-14 13-14s13 6 13 14v36" fill={f} />
          <path d="M56 96h64" />
        </g>
      );
    case "jejum":
      return (
        <g stroke={s} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M90 34c8 10 12 16 12 24a12 12 0 1 1-24 0c0-8 4-14 12-24z" fill={f} />
          <path d="M74 96h32M90 78v18" />
          <path d="M20 96h140" opacity="0.5" />
        </g>
      );
    case "harpa":
      return (
        <g stroke={s} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M52 92V40l52-10v52" />
          <circle cx="44" cy="92" r="9" fill={f} />
          <circle cx="96" cy="82" r="9" fill={f} />
          <path d="M132 40c8 6 8 18 0 24" opacity="0.7" />
        </g>
      );
    case "conhecimento":
      return (
        <g stroke={s} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="42" y="40" width="86" height="54" rx="8" fill={f} />
          <path d="M56 58h58M56 72h44" />
          <path d="M150 26l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill={s} stroke="none" />
        </g>
      );
    case "crescimento":
      return (
        <g stroke={s} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M85 96V56" />
          <path d="M85 68c-14 0-22-8-22-20 14 0 22 8 22 20z" fill={f} />
          <path d="M85 60c12-2 20-10 20-22-13 1-20 9-20 22z" fill={f} />
          <path d="M60 96h50" opacity="0.6" />
        </g>
      );
    case "familia":
      return (
        <g stroke={s} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="58" cy="52" r="11" fill={f} />
          <circle cx="96" cy="50" r="12" fill={f} />
          <circle cx="128" cy="62" r="8" fill={f} />
          <path d="M40 96c0-12 8-20 18-20s18 8 18 20M78 96c0-13 8-22 18-22s18 9 18 22M114 96c0-9 6-15 14-15s14 6 14 15" />
        </g>
      );
    case "casais":
      return (
        <g stroke={s} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="78" cy="66" r="22" />
          <circle cx="108" cy="66" r="22" />
          <path d="M93 40c6-8 18-6 18 4 0 8-12 14-18 20-6-6-18-12-18-20 0-10 12-12 18-4z" fill={f} stroke="none" />
        </g>
      );
    case "criancas":
      return (
        <g stroke={s} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M46 96c0-14 20-22 44-22s44 8 44 22z" fill={f} />
          <path d="M56 62a34 34 0 0 1 68 0" />
          <path d="M66 62a24 24 0 0 1 48 0" opacity="0.7" />
        </g>
      );
    case "desafios":
      return (
        <g stroke={s} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 96l40-46 26 28 22-26 32 44z" fill={f} />
          <path d="M108 52V32l16 6-16 6" fill={s} stroke="none" />
        </g>
      );
  }
}

export function JourneyArt({
  theme,
  className = "",
}: {
  theme: ArtTheme;
  className?: string;
}) {
  const [a, b] = GRADIENTS[theme];
  return (
    <div
      role="img"
      aria-label={ART_ALT[theme]}
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, color-mix(in oklab, ${a} 90%, transparent) 0%, color-mix(in oklab, ${b} 78%, transparent) 100%)`,
      }}
    >
      <svg
        viewBox="0 0 180 110"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        className="absolute inset-0 size-full transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      >
        <Scene theme={theme} />
      </svg>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
    </div>
  );
}

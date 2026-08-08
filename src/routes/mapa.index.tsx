import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Compass, Lock } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { useBibleReads } from "@/hooks/use-bible-reads";
import {
  BIBLE_PLACES,
  countDiscoveredPlaces,
  isPlaceDiscovered,
  projectPlace,
  unlockablePlacesTotal,
} from "@/lib/bible-places";
import { normalize } from "@/lib/atlas-shared";

export const Route = createFileRoute("/mapa/")({
  head: () => ({
    meta: [
      { title: "Mapa Bíblico — lugares da Bíblia | Palavra+" },
      { name: "description", content: "Explore 37 lugares bíblicos com acontecimentos, personagens, contexto histórico e versículos. Descubra novos locais conforme você lê a Bíblia." },
      { property: "og:title", content: "Mapa Bíblico — lugares da Bíblia | Palavra+" },
      { property: "og:description", content: "Explore lugares bíblicos com acontecimentos, personagens e versículos no Palavra+." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MapaPage,
});

function MapaPage() {
  const { readSet } = useBibleReads();
  const [q, setQ] = useState("");
  const [hover, setHover] = useState<string | null>(null);
  const navigate = useNavigate();

  const discovered = countDiscoveredPlaces(readSet);
  const total = unlockablePlacesTotal();

  const list = useMemo(() => {
    const nq = normalize(q);
    return BIBLE_PLACES.filter(
      (p) => !nq || normalize(p.name).includes(nq) || normalize(p.region).includes(nq) || normalize(p.modern).includes(nq),
    );
  }, [q]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Compass, label: "Atlas Bíblico" }}
        title="Mapa Bíblico"
        description="Toque em um lugar para conhecer sua história, personagens e versículos."
        backTo="/"
        backLabel="Início"
      >
        <div className="rounded-2xl bg-white/10 px-4 py-2 text-xs text-hero-foreground/90 backdrop-blur">
          {discovered} de {total} lugares descobertos pela sua leitura
        </div>
      </PageHero>

      <main className="mx-auto max-w-3xl px-4 pt-6">
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 1000 640"
              className="h-auto w-full min-w-[720px] touch-pan-y"
              role="img"
              aria-label="Mapa ilustrativo com os lugares bíblicos"
            >
              <defs>
                <linearGradient id="mapa-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.06 220)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="oklch(0.55 0.07 60)" stopOpacity="0.25" />
                </linearGradient>
              </defs>
              <rect width="1000" height="640" fill="url(#mapa-bg)" />
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 80} x2="1000" y2={i * 80} stroke="currentColor" strokeOpacity="0.07" className="text-foreground" />
              ))}
              {Array.from({ length: 13 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 80} y1="0" x2={i * 80} y2="640" stroke="currentColor" strokeOpacity="0.07" className="text-foreground" />
              ))}
              {BIBLE_PLACES.map((p) => {
                const { x, y } = projectPlace(p.coords);
                const open = isPlaceDiscovered(p, readSet);
                return (
                  <g
                    key={p.id}
                    role="link"
                    tabIndex={0}
                    aria-label={`${p.name} — ${open ? "descoberto" : "ainda não descoberto"}`}
                    onClick={() => navigate({ to: "/mapa/$id", params: { id: p.id } })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") navigate({ to: "/mapa/$id", params: { id: p.id } });
                    }}
                    onMouseEnter={() => setHover(p.id)}
                    onMouseLeave={() => setHover(null)}
                    className="cursor-pointer"
                  >
                    <circle cx={x} cy={y} r="18" fill="transparent" />
                    <circle
                      cx={x}
                      cy={y}
                      r={hover === p.id ? 9 : 7}
                      className={open ? "fill-gold" : "fill-muted-foreground"}
                      fillOpacity={open ? 1 : 0.45}
                      stroke="white"
                      strokeOpacity="0.7"
                      strokeWidth="1.5"
                    />
                    <text
                      x={x + 12}
                      y={y + 4}
                      className="fill-foreground"
                      fontSize="13"
                      fillOpacity={open ? 0.95 : 0.5}
                    >
                      {p.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Arraste para o lado para ver todo o mapa. Mapa esquemático ilustrativo, baseado nas coordenadas aproximadas de cada lugar.
          </p>
        </section>

        <section className="mt-8">
          <label className="sr-only" htmlFor="busca-lugares">Buscar lugar</label>
          <input
            id="busca-lugares"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar lugar (ex.: Belém, Galileia...)"
            className="w-full rounded-full bg-secondary px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
          />

          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {list.map((p) => {
              const open = isPlaceDiscovered(p, readSet);
              return (
                <li key={p.id}>
                  <Link
                    to="/mapa/$id"
                    params={{ id: p.id }}
                    className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40"
                  >
                    <span className="text-2xl" aria-hidden="true">{p.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-serif text-lg text-card-foreground">{p.name}</span>
                        {open ? (
                          <MapPin className="size-3.5 shrink-0 text-gold" aria-label="Descoberto" />
                        ) : (
                          <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-label="Ainda não descoberto" />
                        )}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">{p.region} · {p.modern || "Localização atual incerta"}</span>
                      <span className="mt-2 block line-clamp-2 text-sm text-muted-foreground">{p.summary}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {list.length === 0 && (
            <p className="mt-8 text-center font-serif text-muted-foreground">Nenhum lugar encontrado.</p>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

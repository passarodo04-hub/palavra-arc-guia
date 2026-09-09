import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Compass, Lock } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { BibleMapPanel } from "@/components/atlas/BibleMapPanel";
import { useBibleReads } from "@/hooks/use-bible-reads";
import {
  BIBLE_PLACES,
  countDiscoveredPlaces,
  isPlaceDiscovered,
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
          <BibleMapPanel
            readSet={readSet}
            onOpen={(id) => navigate({ to: "/mapa/$id", params: { id } })}
          />
          <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Mapa geográfico real (OpenStreetMap). Use dois dedos ou a rolagem para dar zoom e arraste para mover.
            Marcadores dourados são lugares já descobertos pela sua leitura.
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

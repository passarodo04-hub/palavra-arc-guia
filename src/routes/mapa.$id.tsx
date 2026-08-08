import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookOpen, Compass, MapPin } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { ArtPortrait } from "@/components/atlas/ArtPortrait";
import { useBibleReads } from "@/hooks/use-bible-reads";
import { isPlaceDiscovered, placeById } from "@/lib/bible-places";

export const Route = createFileRoute("/mapa/$id")({
  loader: ({ params }) => {
    const place = placeById(params.id);
    if (!place) throw notFound();
    return { place };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Lugar não encontrado | Palavra+" }, { name: "robots", content: "noindex" }] };
    }
    const { place } = loaderData;
    const title = `${place.name} — Mapa Bíblico | Palavra+`;
    return {
      meta: [
        { title },
        { name: "description", content: place.summary.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: place.summary.slice(0, 155) },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: PlaceDetail,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gold">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-card-foreground">{children}</div>
    </section>
  );
}

function PlaceDetail() {
  const { place } = Route.useLoaderData();
  const { readSet } = useBibleReads();
  const discovered = isPlaceDiscovered(place, readSet);

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Compass, label: "Mapa Bíblico" }}
        title={place.name}
        description={place.summary}
        backTo="/mapa"
        backLabel="Mapa Bíblico"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6">
        <ArtPortrait id={place.id} emoji={place.emoji} label={place.name} />

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">📍 {place.region}</span>
          {place.modern && (
            <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
              <MapPin className="mr-1 inline size-3" />
              {place.modern}
            </span>
          )}
          <span className={`rounded-full px-3 py-1 ${discovered ? "bg-gold/15 text-gold" : "bg-secondary text-muted-foreground"}`}>
            {discovered ? "Descoberto na sua leitura" : "Leia os capítulos relacionados para descobrir"}
          </span>
        </div>

        <Section title="Acontecimentos bíblicos">
          <ul className="list-disc space-y-1.5 pl-5">
            {place.events.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </Section>

        <Section title="Personagens relacionados">
          <div className="flex flex-wrap gap-2">
            {place.people.map((p) => (
              <span key={p} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{p}</span>
            ))}
          </div>
        </Section>

        <Section title="Contexto histórico">{place.history}</Section>

        {place.curiosities.length > 0 && (
          <Section title="Curiosidades">
            <ul className="list-disc space-y-1.5 pl-5">
              {place.curiosities.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </Section>
        )}

        {place.verses.length > 0 && (
          <Section title="Versículos relacionados">
            <ul className="space-y-3">
              {place.verses.map((v) => (
                <li key={v.ref}>
                  <Link
                    to="/biblia/$book/$chapter"
                    params={{ book: v.book, chapter: String(v.chapter) }}
                    className="block rounded-xl bg-secondary p-4 transition-colors hover:bg-secondary/70"
                  >
                    <span className="text-xs text-gold">{v.ref}</span>
                    <p className="mt-1 font-serif">"{v.text}"</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {place.refs.length > 0 && (
          <Section title="Leia na Bíblia">
            <div className="flex flex-wrap gap-2">
              {place.refs.map((r) => (
                <Link
                  key={r.label}
                  to="/biblia/$book/$chapter"
                  params={{ book: r.book, chapter: String(r.chapter) }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                >
                  <BookOpen className="size-3.5" />
                  {r.label}
                </Link>
              ))}
            </div>
          </Section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

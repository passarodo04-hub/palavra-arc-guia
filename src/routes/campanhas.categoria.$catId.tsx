import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { TrackCard } from "@/components/campaigns/TrackCard";
import { useAllCampaigns } from "@/lib/campaigns";
import { trackProgress } from "@/lib/journeys";
import { categoryById, JOURNEY_CATEGORIES } from "@/lib/journey-catalog";

export const Route = createFileRoute("/campanhas/categoria/$catId")({
  loader: ({ params }) => {
    const c = categoryById(params.catId);
    if (!c) throw notFound();
    return { label: c.label, blurb: c.blurb };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Categoria não encontrada — Palavra+" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.label} — Jornadas — Palavra+`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.blurb },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { catId } = Route.useParams();
  const category = categoryById(catId) ?? JOURNEY_CATEGORIES[0];
  const state = useAllCampaigns();

  const items = useMemo(
    () =>
      category.tracks.map((track) => {
        const p = trackProgress(track.campaignId, state);
        return {
          track,
          progress: { percent: p.percent, detail: p.detail, started: p.started, completed: p.completed },
        };
      }),
    [category, state],
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: category.icon, label: "Explore Jornadas" }}
        title={category.label}
        description={category.blurb}
        backTo="/campanhas"
        backLabel="Jornadas"
      />

      <main className="mx-auto max-w-5xl px-4 pt-6">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ track, progress }) => (
            <li key={track.id} className="animate-fade-up">
              <TrackCard track={track} progress={progress} size="lg" />
            </li>
          ))}
        </ul>

        <section className="mt-10 animate-fade-up">
          <h2 className="px-1 font-serif text-xl text-foreground">Outras categorias</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {JOURNEY_CATEGORIES.filter((c) => c.id !== category.id).map((c) => (
              <li key={c.id}>
                <a
                  href={`/campanhas/categoria/${c.id}`}
                  className="inline-block rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-gold/50"
                >
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

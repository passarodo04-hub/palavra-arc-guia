import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookOpen, Crown } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { ArtPortrait } from "@/components/atlas/ArtPortrait";
import { kingById, REALM_META, VERDICT_META } from "@/lib/bible-kings";

export const Route = createFileRoute("/reis/$id")({
  loader: ({ params }) => {
    const king = kingById(params.id);
    if (!king) throw notFound();
    return { king };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Rei não encontrado | Palavra+" }, { name: "robots", content: "noindex" }] };
    }
    const { king } = loaderData;
    const title = `${king.name} — ${REALM_META[king.realm].label} | Palavra+`;
    return {
      meta: [
        { title },
        { name: "description", content: king.summary.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: king.summary.slice(0, 155) },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: KingDetail,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gold">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-card-foreground">{children}</div>
    </section>
  );
}

function KingDetail() {
  const { king } = Route.useLoaderData();
  const realm = REALM_META[king.realm];

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Crown, label: realm.label }}
        title={king.name}
        description={king.summary}
        backTo="/reis"
        backLabel="Reis"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6">
        <ArtPortrait id={king.id} emoji={realm.emoji} label={`o rei ${king.name}`} />

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">{realm.emoji} {realm.label}</span>
          {king.period && <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">⏳ {king.period}</span>}
          <span className="rounded-full bg-gold/15 px-3 py-1 text-gold">
            {VERDICT_META[king.verdict].emoji} {VERDICT_META[king.verdict].label}
          </span>
        </div>

        <Section title="História">{king.history}</Section>

        <Section title="Acontecimentos principais">
          <ul className="list-disc space-y-1.5 pl-5">
            {king.events.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </Section>

        <Section title="Relação com Deus">{king.godRelation}</Section>

        {(king.people.length > 0 || king.places.length > 0) && (
          <Section title="Pessoas e lugares">
            <div className="flex flex-wrap gap-2">
              {king.people.map((p) => (
                <span key={p} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">👤 {p}</span>
              ))}
              {king.places.map((p) => (
                <span key={p} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">📍 {p}</span>
              ))}
            </div>
          </Section>
        )}

        {king.curiosities.length > 0 && (
          <Section title="Curiosidades">
            <ul className="list-disc space-y-1.5 pl-5">
              {king.curiosities.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </Section>
        )}

        {king.refs.length > 0 && (
          <Section title="Leia na Bíblia">
            <div className="flex flex-wrap gap-2">
              {king.refs.map((r) => (
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

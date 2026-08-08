import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookOpen, Swords } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { ArtPortrait } from "@/components/atlas/ArtPortrait";
import { judgeById, type BibleJudge } from "@/lib/bible-judges";

export const Route = createFileRoute("/juizes/$id")({
  loader: ({ params }) => {
    const judge = judgeById(params.id);
    if (!judge) throw notFound();
    return { judge };
  },
  head: ({ loaderData }: { loaderData?: { judge: BibleJudge } }) => {
    if (!loaderData) {
      return { meta: [{ title: "Juiz não encontrado | Palavra+" }, { name: "robots", content: "noindex" }] };
    }
    const { judge } = loaderData;
    const title = `${judge.name} — Juízes de Israel | Palavra+`;
    return {
      meta: [
        { title },
        { name: "description", content: judge.summary.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: judge.summary.slice(0, 155) },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: JudgeDetail,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gold">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-card-foreground">{children}</div>
    </section>
  );
}

function JudgeDetail() {
  const { judge } = Route.useLoaderData() as { judge: BibleJudge };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Swords, label: "Juízes de Israel" }}
        title={judge.name}
        description={judge.summary}
        backTo="/juizes"
        backLabel="Juízes"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6">
        <ArtPortrait id={judge.id} emoji={judge.emoji} label={`o juiz ${judge.name}`} />

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">🏷️ Tribo: {judge.tribe}</span>
          <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">⏳ {judge.period}</span>
          <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">⚔️ Opressor: {judge.oppressor}</span>
        </div>

        <Section title="Contexto">{judge.context}</Section>
        <Section title="Atuação">{judge.role}</Section>

        <Section title="Acontecimentos">
          <ul className="list-disc space-y-1.5 pl-5">
            {judge.story.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </Section>

        {(judge.people.length > 0 || judge.places.length > 0) && (
          <Section title="Pessoas e lugares">
            <div className="flex flex-wrap gap-2">
              {judge.people.map((p) => (
                <span key={p} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">👤 {p}</span>
              ))}
              {judge.places.map((p) => (
                <span key={p} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">📍 {p}</span>
              ))}
            </div>
          </Section>
        )}

        {judge.curiosities.length > 0 && (
          <Section title="Curiosidades">
            <ul className="list-disc space-y-1.5 pl-5">
              {judge.curiosities.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </Section>
        )}

        {judge.traditionNote && (
          <section className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gold">
              Texto bíblico × tradição posterior
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{judge.traditionNote}</p>
          </section>
        )}

        {judge.refs.length > 0 && (
          <Section title="Leia na Bíblia">
            <div className="flex flex-wrap gap-2">
              {judge.refs.map((r) => (
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

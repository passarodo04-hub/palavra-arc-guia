import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Quote, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { getResumoById, type ResumoBiblico } from "@/lib/resumo-biblico-data";

export const Route = createFileRoute("/resumo/$book")({
  component: ResumoBookPage,
  loader: ({ params }) => {
    const resumo = getResumoById(params.book);
    if (!resumo) throw notFound();
    return { resumo };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
      Livro não encontrado.
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
      {error.message}
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.resumo.name} — Resumo Bíblico` },
          { name: "description", content: loaderData.resumo.summary.slice(0, 155) },
        ]
      : [],
  }),
});

function ResumoBookPage() {
  const { resumo } = Route.useLoaderData() as { resumo: ResumoBiblico };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="relative overflow-hidden bg-gradient-spiritual text-primary-foreground">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 10%, white, transparent 50%)" }} />
        <div className="relative mx-auto max-w-3xl px-6 pt-10 pb-10">
          <Link to="/resumo" className="inline-flex items-center gap-1.5 text-xs text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowLeft className="size-3.5" /> Resumo Bíblico
          </Link>
          <div className="mt-4 flex items-center gap-2 text-gold">
            <Sparkles className="size-4" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">
              {resumo.testament === "old" ? "Antigo Testamento" : "Novo Testamento"}
            </span>
          </div>
          <h1 className="mt-3 font-serif text-4xl leading-tight">{resumo.name}</h1>
          <p className="mt-2 text-sm text-primary-foreground/80">{resumo.theme}</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 -mt-6 space-y-4">
        <Card>
          <div className="space-y-4">
            <Field label="Autor tradicional">{resumo.author}</Field>
            <Field label="Contexto histórico">{resumo.context}</Field>
            <Field label="Tema principal">{resumo.theme}</Field>
            <Field label="Propósito">{resumo.purpose}</Field>
          </div>
        </Card>

        <Card>
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Resumo rápido</div>
          <p className="mt-2 font-serif text-lg leading-relaxed text-card-foreground">{resumo.summary}</p>
        </Card>

        <Card>
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Principais ensinamentos</div>
          <ul className="mt-3 space-y-2">
            {resumo.teachings.map((t) => (
              <li key={t} className="flex gap-2 text-sm text-card-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Versículos importantes</div>
          <ul className="mt-3 space-y-2">
            {resumo.keyVerses.map((v) => (
              <li key={v} className="flex items-start gap-2 text-sm text-card-foreground">
                <Quote className="mt-0.5 size-3.5 text-gold shrink-0" />
                <span className="font-medium">{v}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Curiosidades</div>
          <ul className="mt-3 space-y-2">
            {resumo.facts.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-card-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Link
          to="/biblia/$book"
          params={{ book: resumo.id }}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
        >
          <BookOpen className="size-4" /> Ler {resumo.name} na Bíblia
        </Link>
      </main>
      <BottomNav />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">{children}</section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-card-foreground">{children}</div>
    </div>
  );
}
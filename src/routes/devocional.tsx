import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { getDailyDevocional } from "@/lib/devocional-data";
import { Share2, Bookmark } from "lucide-react";

export const Route = createFileRoute("/devocional")({ component: DevocionalPage });

function DevocionalPage() {
  const d = getDailyDevocional();
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <h1 className="font-serif text-3xl">Devocional Diário</h1>
        <p className="text-sm text-primary-foreground/70">Uma palavra para hoje</p>
      </header>
      <main className="mx-auto max-w-2xl px-4 pt-6">
        <article className="rounded-3xl border border-border bg-card p-8 shadow-elegant animate-fade-up">
          <div className="text-xs uppercase tracking-widest text-gold">Versículo do Dia</div>
          <blockquote className="mt-3 font-serif text-2xl leading-relaxed">"{d.text}"</blockquote>
          <div className="mt-2 text-sm text-muted-foreground">— {d.verse}</div>
          <div className="my-8 h-px bg-border" />
          <div className="text-xs uppercase tracking-widest text-gold">Reflexão</div>
          <p className="mt-3 font-serif text-lg leading-relaxed text-card-foreground">{d.reflection}</p>
          <div className="mt-6 text-sm text-muted-foreground">Leitura recomendada: <span className="text-foreground font-medium">{d.reading}</span></div>
          <div className="mt-8 flex gap-3">
            <button onClick={() => navigator.share?.({ title: "Devocional", text: `"${d.text}" — ${d.verse}` })} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">
              <Share2 className="size-4" /> Compartilhar
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm">
              <Bookmark className="size-4" /> Salvar
            </button>
          </div>
        </article>
      </main>
      <BottomNav />
    </div>
  );
}
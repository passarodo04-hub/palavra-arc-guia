import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { useSavedDevocionais } from "@/lib/devocional-saved";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/devocional-salvos")({ component: SavedPage });

function SavedPage() {
  const { list, remove } = useSavedDevocionais();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = list.find((d) => d.id === openId);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <Link to="/devocional" className="inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground">
          <ArrowLeft className="size-4" /> Devocional
        </Link>
        <h1 className="mt-2 font-serif text-3xl">Devocionais Salvos</h1>
        <p className="text-sm text-primary-foreground/70">{list.length} salvo{list.length === 1 ? "" : "s"} neste dispositivo</p>
      </header>
      <main className="mx-auto max-w-2xl px-4 pt-6">
        {list.length === 0 ? (
          <p className="text-center text-muted-foreground py-16 font-serif text-lg">Você ainda não salvou nenhum devocional.</p>
        ) : (
          <ul className="space-y-3">
            {list.map((d) => (
              <li key={d.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <button className="text-left w-full" onClick={() => setOpenId(d.id)}>
                  <div className="text-xs text-gold">{d.verse}</div>
                  <p className="mt-2 font-serif text-lg leading-snug line-clamp-2">"{d.text}"</p>
                </button>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{new Date(d.savedAt).toLocaleDateString("pt-BR")}</span>
                  <button
                    onClick={() => remove(d.id)}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3" /> Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {open && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={() => setOpenId(null)}>
            <div className="w-full max-w-2xl rounded-3xl bg-card p-8 shadow-elegant animate-fade-up max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="text-xs uppercase tracking-widest text-gold">Versículo</div>
              <blockquote className="mt-3 font-serif text-2xl leading-relaxed">"{open.text}"</blockquote>
              <div className="mt-2 text-sm text-muted-foreground">— {open.verse}</div>
              <div className="my-6 h-px bg-border" />
              <div className="text-xs uppercase tracking-widest text-gold">Reflexão</div>
              <p className="mt-3 font-serif text-lg leading-relaxed">{open.reflection}</p>
              <div className="mt-4 text-sm text-muted-foreground">Leitura: <span className="text-foreground font-medium">{open.reading}</span></div>
              <button onClick={() => setOpenId(null)} className="mt-6 w-full rounded-xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">Fechar</button>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
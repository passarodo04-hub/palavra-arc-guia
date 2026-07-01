import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { getDailyDevocional } from "@/lib/devocional-data";
import { Share2, Bookmark, BookmarkCheck, Check, Copy, Link as LinkIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSavedDevocionais } from "@/lib/devocional-saved";
import { toast } from "sonner";

export const Route = createFileRoute("/devocional")({ component: DevocionalPage });

function DevocionalPage() {
  const d = getDailyDevocional();
  const { isSaved, save, remove, list } = useSavedDevocionais();
  const saved = isSaved(d.verse);
  const [shareOpen, setShareOpen] = useState(false);

  const appName = "Palavra+";
  const shareTitle = `Devocional — ${d.verse}`;
  const shareText = `${shareTitle}\n\n"${d.text}"\n— ${d.verse}\n\n${d.reflection}\n\nvia ${appName}`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://palavra-arc-guia.lovable.app/devocional";

  const handleSave = () => {
    if (saved) {
      remove(d.verse);
      toast.success("Devocional removido dos salvos");
    } else {
      const ok = save({ id: d.verse, verse: d.verse, text: d.text, reflection: d.reflection, reading: d.reading });
      toast.success(ok ? "Devocional salvo" : "Este devocional já está salvo");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }
    setShareOpen(true);
  };

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado`);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const enc = encodeURIComponent(`${shareText}\n${shareUrl}`);
  const encUrl = encodeURIComponent(shareUrl);
  const encText = encodeURIComponent(shareText);
  const shareLinks = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${encUrl}&text=${encText}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}` },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Devocional Diário</h1>
            <p className="text-sm text-primary-foreground/70">Uma palavra para hoje</p>
          </div>
          <Link
            to="/devocional-salvos"
            className="rounded-full bg-primary-foreground/10 px-4 py-2 text-xs backdrop-blur hover:bg-primary-foreground/20"
          >
            Salvos ({list.length})
          </Link>
        </div>
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
            <button onClick={handleNativeShare} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">
              <Share2 className="size-4" /> Compartilhar
            </button>
            <button onClick={handleSave} className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm">
              {saved ? <BookmarkCheck className="size-4 text-gold" /> : <Bookmark className="size-4" />}
              {saved ? "Salvo" : "Salvar"}
            </button>
          </div>
        </article>

        {shareOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
            onClick={() => setShareOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-card p-6 shadow-elegant animate-fade-up"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-serif text-xl">Compartilhar devocional</h2>
              <p className="mt-1 text-sm text-muted-foreground">Escolha como deseja compartilhar</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {shareLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-border bg-secondary px-3 py-3 text-center text-sm hover:bg-secondary/70"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={() => copy(shareText, "Texto")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm hover:bg-secondary"
                >
                  <Copy className="size-4" /> Copiar texto
                </button>
                <button
                  onClick={() => copy(shareUrl, "Link")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm hover:bg-secondary"
                >
                  <LinkIcon className="size-4" /> Copiar link
                </button>
              </div>
              <button
                onClick={() => setShareOpen(false)}
                className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm text-primary-foreground"
              >
                <Check className="mr-1 inline size-4" /> Fechar
              </button>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
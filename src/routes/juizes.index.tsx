import { createFileRoute, Link } from "@tanstack/react-router";
import { Swords } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { ArtPortrait } from "@/components/atlas/ArtPortrait";
import { BIBLE_JUDGES } from "@/lib/bible-judges";

export const Route = createFileRoute("/juizes/")({
  head: () => ({
    meta: [
      { title: "Juízes de Israel | Palavra+" },
      { name: "description", content: "Otniel, Débora, Gideão, Sansão e os demais juízes de Israel: contexto, história, referências bíblicas e o que é tradição posterior." },
      { property: "og:title", content: "Juízes de Israel | Palavra+" },
      { property: "og:description", content: "Contexto, história e referências bíblicas dos juízes de Israel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JudgesPage,
});

function JudgesPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Swords, label: "Atlas Bíblico" }}
        title="Juízes de Israel"
        description="Os libertadores levantados entre Josué e a monarquia, segundo o livro de Juízes."
        backTo="/"
        backLabel="Início"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6">
        <ul className="grid gap-4 sm:grid-cols-2">
          {BIBLE_JUDGES.map((j) => (
            <li key={j.id}>
              <Link
                to="/juizes/$id"
                params={{ id: j.id }}
                className="block h-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40"
              >
                <ArtPortrait id={j.id} emoji={j.emoji} label={`o juiz ${j.name}`} className="rounded-none border-0" />
                <div className="p-4">
                  <div className="font-serif text-lg text-card-foreground">{j.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">Tribo: {j.tribe}</div>
                  <div className="mt-2 text-xs text-gold">{j.period}</div>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{j.summary}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <BottomNav />
    </div>
  );
}

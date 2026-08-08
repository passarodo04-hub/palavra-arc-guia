import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { ArtPortrait } from "@/components/atlas/ArtPortrait";
import { BIBLE_KINGS, REALM_META, VERDICT_META, type Realm } from "@/lib/bible-kings";

export const Route = createFileRoute("/reis/")({
  head: () => ({
    meta: [
      { title: "Reis de Israel e Judá | Palavra+" },
      { name: "description", content: "Conheça os reis do Reino Unido, de Israel e de Judá: período, avaliação bíblica, acontecimentos e referências para leitura." },
      { property: "og:title", content: "Reis de Israel e Judá | Palavra+" },
      { property: "og:description", content: "Reino Unido, Israel e Judá — história, acontecimentos e referências bíblicas de cada rei." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KingsPage,
});

const ORDER: Realm[] = ["unido", "israel", "juda"];

function KingsPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Crown, label: "Atlas Bíblico" }}
        title="Reis de Israel e Judá"
        description="Organizados por reino, com o que o texto bíblico registra sobre cada um."
        backTo="/"
        backLabel="Início"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6">
        {ORDER.map((realm) => {
          const meta = REALM_META[realm];
          const kings = BIBLE_KINGS.filter((k) => k.realm === realm).sort((a, b) => a.order - b.order);
          return (
            <section key={realm} className="mt-8 first:mt-0">
              <h2 className="px-1 font-serif text-2xl text-foreground">
                <span aria-hidden="true">{meta.emoji}</span> {meta.label}
              </h2>
              <p className="mt-1 px-1 text-sm text-muted-foreground">{meta.description}</p>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {kings.map((k) => (
                  <li key={k.id}>
                    <Link
                      to="/reis/$id"
                      params={{ id: k.id }}
                      className="block h-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40"
                    >
                      <ArtPortrait id={k.id} emoji={meta.emoji} label={`o rei ${k.name}`} className="rounded-none border-0" />
                      <div className="p-4">
                        <div className="font-serif text-lg text-card-foreground">{k.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{k.period || "Período não informado no texto"}</div>
                        <div className="mt-2 text-xs text-gold">
                          {VERDICT_META[k.verdict].emoji} {VERDICT_META[k.verdict].label}
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{k.summary}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
      <BottomNav />
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Compass, Footprints, Music2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { usePilgrim } from "@/lib/pilgrim-context";

export const Route = createFileRoute("/peregrino")({
  head: () => ({
    meta: [
      { title: "Modo Peregrino — leitura sem distrações | Palavra+" },
      { name: "description", content: "Uma experiência silenciosa no Palavra+: menos elementos na tela, foco na Bíblia, na oração e na reflexão. Seu progresso continua guardado." },
      { property: "og:title", content: "Modo Peregrino — leitura sem distrações | Palavra+" },
      { property: "og:description", content: "Menos distrações, foco na Bíblia e na oração. Todo o seu progresso continua guardado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PilgrimPage,
});

function PilgrimPage() {
  const { active, enter, exit } = usePilgrim();

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Compass, label: "Modo Peregrino" }}
        title={active ? "Você está caminhando em silêncio." : "Caminhe com menos ruído."}
        description="Uma leitura tranquila: menos elementos na tela, foco na Palavra, na oração e na reflexão."
        backTo="/"
        backLabel="Início"
      />

      <main className="mx-auto max-w-3xl px-4 pt-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
          <p className="font-serif text-xl leading-relaxed text-card-foreground">
            {active
              ? "O Modo Peregrino está ativo. A interface fica mais simples e discreta enquanto você lê."
              : "Ao ativar, o aplicativo esconde estatísticas, contadores e elementos competitivos. Nada é apagado."}
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li>• Seu XP, sequências, Jornadas, Caminhada e Mochila continuam guardados.</li>
            <li>• Nenhum dado é apagado — apenas a interface muda.</li>
            <li>• Você pode sair a qualquer momento.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            {active ? (
              <button
                type="button"
                onClick={exit}
                className="rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-transform hover:scale-[1.02]"
              >
                Sair do Modo Peregrino
              </button>
            ) : (
              <button
                type="button"
                onClick={enter}
                className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-soft transition-transform hover:scale-[1.02]"
              >
                Entrar no Modo Peregrino
              </button>
            )}
            <Link
              to="/biblia"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-gold/40"
            >
              <BookOpen className="size-4" /> Ir para a Bíblia
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <Music2 className="size-5 text-gold" />
            <h2 className="mt-2 font-serif text-lg text-card-foreground">Áudio ambiente</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use o botão flutuante para escolher chuva, rio, pássaros, floresta, piano ou adoração instrumental.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <Footprints className="size-5 text-gold" />
            <h2 className="mt-2 font-serif text-lg text-card-foreground">Sua caminhada segue</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tudo o que você já conquistou permanece disponível quando você sair do Modo Peregrino.
            </p>
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

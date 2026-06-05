import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { BookOpen, Music, Sun, NotebookPen, Heart, Search, Sparkles, ArrowRight, Landmark, UserCircle2, BookOpenCheck } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { getDailyDevocional } from "@/lib/devocional-data";
import { useAuth } from "@/lib/auth-context";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const dev = getDailyDevocional();
  const { user } = useAuth();
  const quickItems = [
    { to: "/biblia", icon: BookOpen, title: "Bíblia", desc: "Almeida Revista e Corrigida" },
    { to: "/resumo", icon: BookOpenCheck, title: "Resumo Bíblico", desc: "Visão geral dos 66 livros" },
    { to: "/harpa", icon: Music, title: "Harpa Cristã", desc: "Hinos de adoração" },
    { to: "/devocional", icon: Sun, title: "Devocional", desc: "Mensagem do dia" },
    { to: "/estudos", icon: Sparkles, title: "Estudos IA", desc: "Sermões organizados" },
    { to: "/denominacoes", icon: Landmark, title: "Denominações", desc: "Enciclopédia cristã" },
    { to: "/anotacoes", icon: NotebookPen, title: "Anotações", desc: "Suas notas e estudos" },
    { to: "/favoritos", icon: Heart, title: "Favoritos", desc: "Versos guardados" },
    { to: "/busca", icon: Search, title: "Buscar", desc: "Encontre rapidamente" },
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-spiritual text-primary-foreground">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 10%, white, transparent 50%)" }} />
        <Link
          to={user ? "/conta" : "/login"}
          className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-white/20"
        >
          <UserCircle2 className="size-4" />
          {user ? "Minha conta" : "Entrar"}
        </Link>
        <div className="relative mx-auto max-w-3xl px-6 pt-12 pb-16 animate-fade-up">
          <div className="flex items-center gap-2 text-gold">
            <Sparkles className="size-4" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Bíblia Sagrada ARC</span>
          </div>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl font-medium leading-tight">
            Leve a Palavra de Deus<br />com você todos os dias.
          </h1>
          <p className="mt-3 text-sm md:text-base text-primary-foreground/70 max-w-md">
            Bíblia, Harpa Cristã, devocional diário e estudos — em um só lugar, com paz e elegância.
          </p>
          <Link to="/biblia" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-soft transition-transform hover:scale-[1.02]">
            Começar a ler <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 -mt-10">
        {/* Daily verse */}
        <section className="relative rounded-3xl border border-border bg-card p-6 md:p-8 shadow-elegant animate-fade-up">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Versículo do Dia</div>
          <blockquote className="mt-3 font-serif text-xl md:text-2xl leading-relaxed text-card-foreground">
            "{dev.text}"
          </blockquote>
          <div className="mt-3 text-sm text-muted-foreground">— {dev.verse}</div>
          <Link to="/devocional" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-gold transition-colors">
            Ler reflexão completa <ArrowRight className="size-3.5" />
          </Link>
        </section>

        {/* Quick access */}
        <section className="mt-8">
          <h2 className="px-2 font-serif text-2xl text-foreground">Acesso rápido</h2>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickItems.map(({ to, icon: Icon, title, desc }, i) => (
              <Link
                key={to}
                to={to}
                style={{ animationDelay: `${i * 60}ms` }}
                className="group animate-fade-up rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-gold transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
                  <Icon className="size-5" />
                </div>
                <div className="mt-3 font-serif text-lg text-card-foreground">{title}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Continue reading */}
        <section className="mt-8 rounded-2xl border border-border bg-secondary/50 p-5 animate-fade-up">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Continuar leitura</div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <div className="font-serif text-xl text-foreground">João 3</div>
              <div className="text-xs text-muted-foreground">Novo Testamento</div>
            </div>
            <Link to="/biblia/$book/$chapter" params={{ book: "jo", chapter: "3" }} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
              Abrir <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>

        <AdSlot slot="home-bottom" />

        <footer className="mt-10 text-center text-xs text-muted-foreground space-x-4">
          <Link to="/privacidade" className="hover:text-foreground">Privacidade</Link>
          <span>·</span>
          <Link to="/termos" className="hover:text-foreground">Termos</Link>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}

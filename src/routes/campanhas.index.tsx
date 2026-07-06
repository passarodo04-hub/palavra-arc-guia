import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Target, BookOpen, HandHeart, Utensils, Music, GraduationCap, Sprout, Heart, Users, Baby, Trophy, ArrowRight, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/campanhas/")({
  head: () => ({
    meta: [
      { title: "Campanhas — Palavra+" },
      { name: "description", content: "Fortaleça sua caminhada com Deus através de desafios espirituais, metas pessoais e crescimento diário." },
      { property: "og:title", content: "Campanhas — Palavra+" },
      { property: "og:description", content: "Desafios espirituais, metas e crescimento diário na sua caminhada com Deus." },
    ],
  }),
  component: CampanhasPage,
});

type Difficulty = "Iniciante" | "Intermediário" | "Avançado";
type Campaign = {
  title: string;
  description: string;
  difficulty: Difficulty;
  duration: string;
};
type Category = {
  id: string;
  label: string;
  icon: typeof BookOpen;
  campaigns: Campaign[];
};

const CATEGORIES: Category[] = [
  {
    id: "leitura",
    label: "Leitura Bíblica",
    icon: BookOpen,
    campaigns: [
      { title: "Ler toda a Bíblia", description: "Do Gênesis ao Apocalipse no seu ritmo.", difficulty: "Avançado", duration: "365 dias" },
      { title: "Novo Testamento", description: "Do Evangelho de Mateus ao Apocalipse.", difficulty: "Intermediário", duration: "90 dias" },
      { title: "Evangelhos", description: "Mateus, Marcos, Lucas e João.", difficulty: "Iniciante", duration: "40 dias" },
      { title: "Salmos", description: "Um salmo por dia para meditar.", difficulty: "Iniciante", duration: "150 dias" },
      { title: "Provérbios", description: "Sabedoria diária de Salomão.", difficulty: "Iniciante", duration: "31 dias" },
    ],
  },
  {
    id: "oracao",
    label: "Oração",
    icon: HandHeart,
    campaigns: [
      { title: "7 Dias de Oração", description: "Uma semana intensa de comunhão.", difficulty: "Iniciante", duration: "7 dias" },
      { title: "21 Dias de Oração", description: "Formando um hábito espiritual.", difficulty: "Intermediário", duration: "21 dias" },
      { title: "40 Dias de Oração", description: "Uma jornada profunda de fé.", difficulty: "Avançado", duration: "40 dias" },
    ],
  },
  {
    id: "jejum",
    label: "Jejum",
    icon: Utensils,
    campaigns: [
      { title: "Jejum Parcial", description: "Renovação através do jejum leve.", difficulty: "Iniciante", duration: "7 dias" },
      { title: "Jejum de Daniel", description: "Alimentação simples e oração.", difficulty: "Intermediário", duration: "21 dias" },
      { title: "Jejum de Redes Sociais", description: "Silêncio digital para ouvir a Deus.", difficulty: "Iniciante", duration: "14 dias" },
    ],
  },
  {
    id: "harpa",
    label: "Harpa Cristã",
    icon: Music,
    campaigns: [
      { title: "50 Hinos", description: "Adoração diária com clássicos.", difficulty: "Iniciante", duration: "50 dias" },
      { title: "100 Hinos", description: "Aprofunde-se no cancioneiro.", difficulty: "Intermediário", duration: "100 dias" },
      { title: "Toda a Harpa", description: "Cante todos os 640 hinos.", difficulty: "Avançado", duration: "640 dias" },
    ],
  },
  {
    id: "conhecimento",
    label: "Conhecimento Bíblico",
    icon: GraduationCap,
    campaigns: [
      { title: "Personagens Bíblicos", description: "Vidas que marcaram a história.", difficulty: "Intermediário", duration: "30 dias" },
      { title: "Profetas", description: "Mensageiros da voz de Deus.", difficulty: "Intermediário", duration: "21 dias" },
      { title: "Milagres", description: "As obras extraordinárias do Senhor.", difficulty: "Iniciante", duration: "14 dias" },
      { title: "Parábolas", description: "As histórias que Jesus contou.", difficulty: "Iniciante", duration: "21 dias" },
    ],
  },
  {
    id: "crescimento",
    label: "Crescimento Espiritual",
    icon: Sprout,
    campaigns: [
      { title: "Devocional Diário", description: "Um momento com Deus todo dia.", difficulty: "Iniciante", duration: "30 dias" },
      { title: "Gratidão", description: "Cultive um coração agradecido.", difficulty: "Iniciante", duration: "21 dias" },
      { title: "Bondade", description: "Pratique um ato de bondade por dia.", difficulty: "Intermediário", duration: "30 dias" },
      { title: "Amor ao Próximo", description: "Viva o segundo maior mandamento.", difficulty: "Intermediário", duration: "40 dias" },
    ],
  },
  {
    id: "familia",
    label: "Família",
    icon: Heart,
    campaigns: [
      { title: "Culto em Família", description: "Reúna a casa em oração diária.", difficulty: "Iniciante", duration: "30 dias" },
      { title: "Bênção dos Filhos", description: "Ore por cada filho todos os dias.", difficulty: "Iniciante", duration: "21 dias" },
    ],
  },
  {
    id: "casais",
    label: "Casais",
    icon: Users,
    campaigns: [
      { title: "Oração a Dois", description: "Uma oração diária com o cônjuge.", difficulty: "Iniciante", duration: "30 dias" },
      { title: "Cantares", description: "Leia Cantares juntos e reflita.", difficulty: "Iniciante", duration: "8 dias" },
    ],
  },
  {
    id: "criancas",
    label: "Crianças",
    icon: Baby,
    campaigns: [
      { title: "Histórias Bíblicas", description: "Uma história por dia para as crianças.", difficulty: "Iniciante", duration: "30 dias" },
      { title: "Versículos para Memorizar", description: "Palavra guardada no coração.", difficulty: "Iniciante", duration: "21 dias" },
    ],
  },
  {
    id: "desafios",
    label: "Desafios",
    icon: Trophy,
    campaigns: [
      { title: "Sem Reclamar", description: "21 dias sem uma única reclamação.", difficulty: "Avançado", duration: "21 dias" },
      { title: "Perdão", description: "Perdoe uma pessoa por dia.", difficulty: "Avançado", duration: "7 dias" },
      { title: "Silêncio e Escuta", description: "Ouça mais, fale menos.", difficulty: "Intermediário", duration: "14 dias" },
    ],
  },
];

const DIFFICULTY_CLASSES: Record<Difficulty, string> = {
  Iniciante: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Intermediário: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Avançado: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

function CampanhasPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Target, label: "Campanhas" }}
        title="Campanhas"
        description="Fortaleça sua caminhada com Deus através de desafios espirituais, metas pessoais e crescimento diário."
      />

      <main className="mx-auto max-w-3xl px-4 pt-6">
        {/* Featured campaign */}
        <section
          className="relative overflow-hidden rounded-3xl border border-border p-6 md:p-8 shadow-elegant animate-fade-up"
          style={{ background: "var(--gradient-primary, linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.7)))" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 90% 10%, white, transparent 55%)" }}
          />
          <div className="relative text-primary-foreground">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold">
              <Sparkles className="size-3.5" />
              Campanha em destaque
            </div>
            <h2 className="mt-4 flex items-center gap-2 font-serif text-2xl md:text-3xl leading-tight">
              <BookOpen className="size-6" />
              Leia toda a Bíblia
            </h2>
            <p className="mt-2 max-w-md text-sm text-primary-foreground/80">
              Planeje sua leitura, acompanhe seu progresso e conclua toda a Palavra de Deus no seu ritmo.
            </p>
            <Button
              type="button"
              className="mt-5 rounded-full bg-gold text-gold-foreground hover:bg-gold/90 h-11 px-6 font-semibold shadow-soft"
            >
              Começar Jornada
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>

        {/* Continue journey */}
        <section className="mt-8">
          <h2 className="px-2 font-serif text-2xl text-foreground">Continue sua caminhada</h2>
          <div className="mt-4 rounded-3xl border border-dashed border-border bg-secondary/40 p-8 text-center animate-fade-up">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-card text-gold shadow-soft">
              <Target className="size-7" />
            </div>
            <h3 className="mt-4 font-serif text-lg text-foreground">
              Você ainda não iniciou nenhuma campanha.
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Escolha uma campanha abaixo para começar sua jornada.
            </p>
          </div>
        </section>

        {/* Categories */}
        <div className="mt-10 space-y-10">
          {CATEGORIES.map((cat) => (
            <CategoryRow key={cat.id} category={cat} />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const Icon = category.icon;
  return (
    <section className="animate-fade-up">
      <div className="flex items-center gap-2 px-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-gold">
          <Icon className="size-5" />
        </span>
        <h3 className="font-serif text-xl text-foreground">{category.label}</h3>
      </div>
      <div className="mt-4 -mx-4 overflow-x-auto scrollbar-none">
        <ul className="flex gap-3 px-4 pb-2 snap-x snap-mandatory">
          {category.campaigns.map((c, i) => (
            <li key={i} className="snap-start shrink-0 w-64">
              <CampaignCard campaign={c} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <button
      type="button"
      className="group relative flex h-full w-full flex-col items-start overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-elegant active:scale-[0.98]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 6%, transparent), transparent 60%)",
        }}
      />
      <div className="relative flex size-11 items-center justify-center rounded-xl bg-secondary text-gold transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
        <Sparkles className="size-5" />
      </div>
      <div className="relative mt-4 font-serif text-lg leading-snug text-card-foreground">
        {campaign.title}
      </div>
      <p className="relative mt-1 line-clamp-2 text-xs text-muted-foreground">
        {campaign.description}
      </p>
      <div className="relative mt-4 flex w-full items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${DIFFICULTY_CLASSES[campaign.difficulty]}`}
        >
          {campaign.difficulty}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          {campaign.duration}
        </span>
      </div>
    </button>
  );
}
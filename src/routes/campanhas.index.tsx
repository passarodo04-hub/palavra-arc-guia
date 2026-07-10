import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Target, BookOpen, HandHeart, Utensils, Music, GraduationCap, Sprout, Heart, Users, Baby, Trophy, ArrowRight, Sparkles, Clock, Brain, Flame, CheckCircle, CalendarDays, Award, TrendingUp, Compass, CheckCircle2, Circle, Play, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CAMPAIGNS,
  campaignById,
  computeDateStreak,
  evaluateBadges,
  readBiblePlanRaw,
  summarizeCampaigns,
  useAllCampaigns,
  computeXP,
  journeyStageFor,
  JOURNEY_STAGES,
  todayTasks,
  recommendationsFor,
  encouragementForDay,
  activityMap,
  greetingForNow,
  BADGES,
  motivationForSlot,
} from "@/lib/campaigns";
import { StatCard } from "@/components/campaigns/StatCard";
import { ActivityCalendar } from "@/components/campaigns/ActivityCalendar";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useMemo, useRef, useState } from "react";

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
  route?: string;
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
      { route: "/campanhas/leia-biblia", title: "Ler toda a Bíblia", description: "Do Gênesis ao Apocalipse no seu ritmo.", difficulty: "Avançado", duration: "365 dias" },
      { route: "/campanhas/leia-biblia", title: "Novo Testamento", description: "Do Evangelho de Mateus ao Apocalipse.", difficulty: "Intermediário", duration: "90 dias" },
      { route: "/campanhas/leia-biblia", title: "Evangelhos", description: "Mateus, Marcos, Lucas e João.", difficulty: "Iniciante", duration: "40 dias" },
      { route: "/campanhas/leia-biblia", title: "Salmos", description: "Um salmo por dia para meditar.", difficulty: "Iniciante", duration: "150 dias" },
      { route: "/campanhas/leia-biblia", title: "Provérbios", description: "Sabedoria diária de Salomão.", difficulty: "Iniciante", duration: "31 dias" },
    ],
  },
  {
    id: "oracao",
    label: "Oração",
    icon: HandHeart,
    campaigns: [
      { route: "/campanhas/oracao", title: "Rotina de Oração", description: "Escolha duração, horário e comece.", difficulty: "Iniciante", duration: "diário" },
      { route: "/campanhas/oracao", title: "21 Dias de Oração", description: "Formando um hábito espiritual.", difficulty: "Intermediário", duration: "21 dias" },
      { route: "/campanhas/oracao", title: "40 Dias de Oração", description: "Uma jornada profunda de fé.", difficulty: "Avançado", duration: "40 dias" },
    ],
  },
  {
    id: "jejum",
    label: "Jejum",
    icon: Utensils,
    campaigns: [
      { route: "/campanhas/jejum", title: "Jejum Parcial", description: "Renovação através do jejum leve.", difficulty: "Iniciante", duration: "7 dias" },
      { route: "/campanhas/jejum", title: "Jejum de Daniel", description: "Alimentação simples e oração.", difficulty: "Intermediário", duration: "21 dias" },
      { route: "/campanhas/jejum", title: "Jejum de Redes Sociais", description: "Silêncio digital para ouvir a Deus.", difficulty: "Iniciante", duration: "14 dias" },
    ],
  },
  {
    id: "harpa",
    label: "Harpa Cristã",
    icon: Music,
    campaigns: [
      { route: "/campanhas/harpa-desafio", title: "30 Hinos", description: "Comece devagar.", difficulty: "Iniciante", duration: "30 hinos" },
      { route: "/campanhas/harpa-desafio", title: "50 Hinos", description: "Adoração diária com clássicos.", difficulty: "Iniciante", duration: "50 hinos" },
      { route: "/campanhas/harpa-desafio", title: "100 Hinos", description: "Aprofunde-se no cancioneiro.", difficulty: "Intermediário", duration: "100 hinos" },
      { route: "/campanhas/harpa-desafio", title: "Toda a Harpa", description: "Cante todos os 640 hinos.", difficulty: "Avançado", duration: "640 hinos" },
    ],
  },
  {
    id: "conhecimento",
    label: "Conhecimento Bíblico",
    icon: GraduationCap,
    campaigns: [
      { route: "/campanhas/conhecimento", title: "Personagens Bíblicos", description: "Vidas que marcaram a história.", difficulty: "Intermediário", duration: "30 dias" },
      { route: "/campanhas/conhecimento", title: "Profetas, Reis, Apóstolos", description: "Estude cada grupo em profundidade.", difficulty: "Intermediário", duration: "21 dias" },
      { route: "/campanhas/conhecimento", title: "Milagres e Parábolas", description: "As obras e ensinos do Senhor.", difficulty: "Iniciante", duration: "14 dias" },
      { route: "/campanhas/quiz", title: "Quiz Bíblico", description: "Teste seu conhecimento em 4 níveis.", difficulty: "Intermediário", duration: "diário" },
    ],
  },
  {
    id: "crescimento",
    label: "Crescimento Espiritual",
    icon: Sprout,
    campaigns: [
      { route: "/campanhas/devocional-diario", title: "Devocional Diário", description: "Um momento com Deus todo dia.", difficulty: "Iniciante", duration: "30 dias" },
      { route: "/campanhas/gratidao", title: "Gratidão", description: "Cultive um coração agradecido.", difficulty: "Iniciante", duration: "21 dias" },
      { route: "/campanhas/crescimento", title: "Fruto do Espírito", description: "Bondade, amor, humildade, paciência...", difficulty: "Intermediário", duration: "40 dias" },
    ],
  },
  {
    id: "familia",
    label: "Família",
    icon: Heart,
    campaigns: [
      { route: "/campanhas/familia", title: "Culto em Família", description: "Reúna a casa em oração diária.", difficulty: "Iniciante", duration: "30 dias" },
      { route: "/campanhas/familia", title: "Bênção dos Filhos", description: "Ore por cada filho todos os dias.", difficulty: "Iniciante", duration: "21 dias" },
    ],
  },
  {
    id: "casais",
    label: "Casais",
    icon: Users,
    campaigns: [
      { route: "/campanhas/casais", title: "Oração a Dois", description: "Uma oração diária com o cônjuge.", difficulty: "Iniciante", duration: "30 dias" },
      { route: "/campanhas/casais", title: "Cantares", description: "Leia Cantares juntos e reflita.", difficulty: "Iniciante", duration: "8 dias" },
    ],
  },
  {
    id: "criancas",
    label: "Crianças",
    icon: Baby,
    campaigns: [
      { route: "/campanhas/criancas", title: "Histórias Bíblicas", description: "Uma história por dia para as crianças.", difficulty: "Iniciante", duration: "30 dias" },
      { route: "/campanhas/criancas", title: "Versículos para Memorizar", description: "Palavra guardada no coração.", difficulty: "Iniciante", duration: "21 dias" },
    ],
  },
  {
    id: "desafios",
    label: "Desafios",
    icon: Trophy,
    campaigns: [
      { route: "/campanhas/crescimento", title: "Sem Reclamar", description: "21 dias sem uma única reclamação.", difficulty: "Avançado", duration: "21 dias" },
      { route: "/campanhas/crescimento", title: "Perdão", description: "Perdoe uma pessoa por dia.", difficulty: "Avançado", duration: "7 dias" },
      { route: "/campanhas/crescimento", title: "Silêncio e Escuta", description: "Ouça mais, fale menos.", difficulty: "Intermediário", duration: "14 dias" },
    ],
  },
];

const DIFFICULTY_CLASSES: Record<Difficulty, string> = {
  Iniciante: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Intermediário: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Avançado: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

function CampanhasPage() {
  const state = useAllCampaigns();
  const { user } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(t);
  }, []);
  const summary = useMemo(() => summarizeCampaigns(state), [state]);
  const badges = useMemo(() => evaluateBadges(state), [state]);
  const xp = useMemo(() => computeXP(state), [state]);
  const journey = useMemo(() => journeyStageFor(xp.level), [xp.level]);
  const tasks = useMemo(() => todayTasks(state), [state]);
  const recs = useMemo(() => recommendationsFor(state), [state]);
  const encouragement = useMemo(() => encouragementForDay(), []);
  const motivation = useMemo(() => motivationForSlot(), []);
  const actMap = useMemo(() => activityMap(state), [state]);
  const plan = readBiblePlanRaw();

  const displayName =
    (user?.user_metadata as { full_name?: string; name?: string } | undefined)?.full_name ??
    (user?.user_metadata as { name?: string } | undefined)?.name ??
    user?.email?.split("@")[0] ??
    null;
  const badgesByCat = useMemo(() => {
    const m = new Map<string, typeof badges>();
    for (const b of badges) {
      const k = b.category ?? "Especial";
      const arr = m.get(k) ?? [];
      arr.push(b);
      m.set(k, arr);
    }
    return Array.from(m.entries());
  }, [badges]);

  const active: {
    id: string;
    title: string;
    route: string;
    percent: number;
    detail: string;
  }[] = [];
  if (plan.active) {
    const cpd = plan.goalDays ? Math.max(1, Math.ceil(1189 / plan.goalDays)) : 1;
    const done = plan.completedDays?.length ?? 0;
    const chapters = Math.min(1189, done * cpd);
    active.push({
      id: "leia-biblia",
      title: "Leia toda a Bíblia",
      route: "/campanhas/leia-biblia",
      percent: Math.round((chapters / 1189) * 100),
      detail: `${done}/${plan.goalDays ?? 0} dias · ${Math.max(0, (plan.goalDays ?? 0) - done)} restantes`,
    });
  }
  for (const [id, c] of Object.entries(state)) {
    if (!c?.active) continue;
    const meta = campaignById(id);
    if (!meta) continue;
    let percent = 0;
    let detail = "";
    if (c.target) {
      percent = Math.min(100, Math.round(((c.counter ?? 0) / c.target) * 100));
      detail = `${c.counter ?? 0} de ${c.target}`;
    } else if (c.endDate && c.startDate) {
      const total = Math.max(1, Math.round((new Date(c.endDate + "T00:00:00").getTime() - new Date(c.startDate + "T00:00:00").getTime()) / 86_400_000));
      const elapsed = Math.min(total, Math.max(0, Math.round((Date.now() - new Date(c.startDate + "T00:00:00").getTime()) / 86_400_000)));
      percent = Math.round((elapsed / total) * 100);
      detail = `dia ${Math.min(elapsed + 1, total)}/${total}`;
    } else if (c.goalDays) {
      percent = Math.min(100, Math.round(((c.completedDates?.length ?? 0) / c.goalDays) * 100));
      detail = `${c.completedDates?.length ?? 0}/${c.goalDays} dias`;
    } else if (c.completedDates?.length) {
      const streak = computeDateStreak(c.completedDates);
      detail = `${streak} ${streak === 1 ? "dia" : "dias"} de sequência`;
    } else if (c.sessions) {
      detail = `${c.sessions} sessões`;
    }
    active.push({ id, title: meta.title, route: meta.route, percent, detail });
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Target, label: "Campanhas" }}
        title={`${greetingForNow()}${displayName ? `, ${displayName}` : ""}!`}
        description="Sua jornada com Deus, um dia de cada vez."
      />

      <main className="mx-auto max-w-3xl px-4 pt-6">
        {/* Today's Journey */}
        <section aria-labelledby="today-title" className="animate-fade-up">
          <div className="flex items-end justify-between px-2">
            <h2 id="today-title" className="font-serif text-2xl text-foreground">Jornada de hoje</h2>
            <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</span>
          </div>
          {tasks.length === 0 ? (
            <p className="mt-3 px-2 text-sm text-muted-foreground">Comece uma campanha abaixo para receber uma jornada diária personalizada.</p>
          ) : (
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {tasks.map((t) => (
                <li key={t.id}>
                  <Link
                    to={t.route}
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-elegant"
                  >
                    <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl">{t.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-serif text-base text-card-foreground">
                        {t.done ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Circle className="size-4 text-muted-foreground" />}
                        <span className="truncate">{t.title}</span>
                      </div>
                      {t.detail && <div className="mt-0.5 truncate text-xs text-muted-foreground">{t.detail}</div>}
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Spiritual Journey + XP */}
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-elegant animate-fade-up">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
            <Compass className="size-3.5" /> Sua caminhada
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div aria-hidden className="text-4xl">{journey.current.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="font-serif text-xl text-foreground">{journey.current.label}</div>
              <div className="text-xs text-muted-foreground">Nível {xp.level} · {xp.xp} XP</div>
            </div>
            {journey.next && (
              <div className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">
                Próximo<br />
                <span className="text-foreground">{journey.next.emoji} {journey.next.label}</span>
              </div>
            )}
          </div>
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={xp.percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-gradient-to-r from-gold to-primary transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${xp.percent}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{xp.levelXp} XP</span>
              <span>{xp.nextLevelXp - xp.levelXp} XP para o próximo nível</span>
            </div>
          </div>
          {/* Journey stages track */}
          <ol className="mt-5 flex items-center gap-1 overflow-x-auto scrollbar-none">
            {JOURNEY_STAGES.map((s, i) => {
              const reached = i <= journey.index;
              return (
                <li key={s.id} className="flex items-center gap-1">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-base transition-colors ${
                      reached ? "bg-gold/15 ring-1 ring-gold" : "bg-secondary text-muted-foreground"
                    }`}
                    title={s.label}
                  >
                    {s.emoji}
                  </div>
                  {i < JOURNEY_STAGES.length - 1 && (
                    <div className={`h-px w-4 ${i < journey.index ? "bg-gold" : "bg-border"}`} />
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {/* Featured campaign */}
        <section
          className="mt-8 relative overflow-hidden rounded-3xl border border-border p-6 md:p-8 shadow-elegant animate-fade-up"
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
              asChild
            >
              <Link to="/campanhas/leia-biblia">
                Começar Jornada
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Continue journey */}
        <section className="mt-8">
          <h2 className="px-2 font-serif text-2xl text-foreground">Continue sua caminhada</h2>
          {active.length === 0 ? (
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
          ) : (
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {active.map((a) => (
                <li key={a.id}>
                  <Link
                    to={a.route}
                    className="group block rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-elegant"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-gold">Em andamento</div>
                    <div className="mt-1 font-serif text-lg text-card-foreground">{a.title}</div>
                    <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-gold to-primary" style={{ width: `${a.percent}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{a.detail}</span>
                      <span className="inline-flex items-center gap-1 text-gold">Continuar <ArrowRight className="size-3.5" /></span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Monthly activity calendar */}
        <section className="mt-10 animate-fade-up">
          <h2 className="px-2 font-serif text-2xl text-foreground">Meu mês</h2>
          <div className="mt-4">
            <ActivityCalendar map={actMap} />
          </div>
        </section>

        {/* Smart recommendations */}
        {recs.length > 0 && (
          <section className="mt-10 animate-fade-up">
            <div className="flex items-center gap-2 px-2">
              <Sparkles className="size-4 text-gold" />
              <h2 className="font-serif text-2xl text-foreground">Recomendado para você</h2>
            </div>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {recs.map((r) => (
                <li key={r.id}>
                  <Link to={r.route} className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-elegant">
                    <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl">{r.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-serif text-base text-card-foreground">{r.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{r.reason}</div>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Encouragement of the day */}
        <section className="mt-10 rounded-3xl border border-border bg-secondary/40 p-6 animate-fade-up">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gold">Inspiração do dia · {encouragement.kind}</div>
          <blockquote className="mt-3 font-serif text-lg text-foreground">"{encouragement.text}"</blockquote>
          <div className="mt-1 text-xs text-muted-foreground">— {encouragement.source}</div>
        </section>

        {/* Profile summary */}
        <section className="mt-10">
          <div className="flex items-center gap-2 px-2">
            <TrendingUp className="size-4 text-gold" />
            <h2 className="font-serif text-2xl text-foreground">Estatísticas pessoais</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Target} label="Ativas" value={String(summary.activeCount)} accent />
            <StatCard icon={CheckCircle} label="Concluídas" value={String(summary.completedCount)} />
            <StatCard icon={Flame} label="Sequência atual" value={`${summary.currentStreak} ${summary.currentStreak === 1 ? "dia" : "dias"}`} accent />
            <StatCard icon={Flame} label="Maior sequência" value={`${summary.longestStreak}`} />
            <StatCard icon={BookOpen} label="Minutos lendo" value={String(summary.readingMinutes)} />
            <StatCard icon={HandHeart} label="Minutos orando" value={String(summary.prayerMinutes)} />
            <StatCard icon={CalendarDays} label="Devocionais" value={String(summary.devocionaisCompletos)} />
            <StatCard icon={Music} label="Hinos" value={String(summary.hinosCompletos)} />
            <StatCard icon={Brain} label="Acertos no Quiz" value={String(summary.quizAcertos)} />
          </div>
        </section>

        {/* Achievements */}
        <section className="mt-10">
          <div className="flex items-center gap-2 px-2">
            <Award className="size-4 text-gold" />
            <h2 className="font-serif text-2xl text-foreground">Conquistas</h2>
          </div>
          <div className="mt-4 space-y-6">
            {badgesByCat.map(([cat, list]) => (
              <div key={cat}>
                <h3 className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{cat}</h3>
                <ul className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {list.map((b) => (
                    <li
                      key={b.id}
                      className={`rounded-2xl border p-4 text-center transition-all ${
                        b.earned ? "border-gold/40 bg-gold/5 shadow-soft animate-fade-up" : "border-border bg-secondary/40 opacity-60"
                      }`}
                      title={b.description}
                    >
                      <div aria-hidden className={`text-3xl ${b.earned ? "" : "grayscale"}`}>{b.emoji}</div>
                      <div className="mt-2 font-serif text-sm text-foreground">{b.label}</div>
                      <div className="mt-1 text-[10px] leading-tight text-muted-foreground line-clamp-2">{b.description}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {b.earned ? "Conquistado" : "Bloqueado"}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
  const inner = (
    <>
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
    </>
  );
  const className =
    "group relative flex h-full w-full flex-col items-start overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-elegant active:scale-[0.98]";
  if (campaign.route) {
    return (
      <Link to={campaign.route} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={className}>
      {inner}
    </button>
  );
}
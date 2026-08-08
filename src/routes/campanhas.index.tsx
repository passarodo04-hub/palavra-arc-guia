import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Target,
  ArrowRight,
  Sparkles,
  Flame,
  Compass,
  Play,
  Quote,
  Award,
  TrendingUp,
  CheckCircle,
  CalendarDays,
  ChevronDown,
  Music2,
  Pause,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { ActivityCalendar } from "@/components/campaigns/ActivityCalendar";
import { JourneyIntro } from "@/components/campaigns/JourneyIntro";
import { JourneyArt } from "@/components/campaigns/JourneyArt";
import { TrackRail } from "@/components/campaigns/TrackRail";
import type { TrackState } from "@/components/campaigns/TrackCard";
import {
  activityMap,
  computeXP,
  encouragementForDay,
  evaluateBadges,
  greetingForNow,
  motivationForSlot,
  summarizeCampaigns,
  useAllCampaigns,
  type CampaignsState,
} from "@/lib/campaigns";
import { trackProgress } from "@/lib/journeys";
import { ALL_TRACKS, JOURNEY_CATEGORIES, LEVEL_CLASSES, type Track } from "@/lib/journey-catalog";
import { useAmbientAudio } from "@/lib/ambient-audio";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/campanhas/")({
  head: () => ({
    meta: [
      { title: "Jornadas — Palavra+" },
      {
        name: "description",
        content:
          "Uma biblioteca de jornadas espirituais: leitura bíblica, oração, jejum, Harpa, família e desafios — com progresso, níveis e conquistas.",
      },
      { property: "og:title", content: "Jornadas — Palavra+" },
      {
        property: "og:description",
        content: "Biblioteca de jornadas espirituais com progresso, níveis e conquistas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JornadasPage,
});

type Item = { track: Track; progress: TrackState };

function buildItems(state: CampaignsState): Item[] {
  return ALL_TRACKS.map((track) => {
    const p = trackProgress(track.campaignId, state);
    return {
      track,
      progress: { percent: p.percent, detail: p.detail, started: p.started, completed: p.completed },
    };
  });
}

function JornadasPage() {
  const state = useAllCampaigns();
  const { user } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const items = useMemo(() => buildItems(state), [state]);
  const summary = useMemo(() => summarizeCampaigns(state), [state]);
  const xp = useMemo(() => computeXP(state), [state]);
  const badges = useMemo(() => evaluateBadges(state), [state]);
  const actMap = useMemo(() => activityMap(state), [state]);
  const encouragement = useMemo(() => encouragementForDay(), []);
  const motivation = useMemo(() => motivationForSlot(), []);

  const inProgress = useMemo(
    () => items.filter((i) => i.progress.started && i.progress.percent < 100),
    [items],
  );
  const completedCount = useMemo(
    () => new Set(items.filter((i) => i.progress.completed).map((i) => i.track.campaignId)).size,
    [items],
  );
  const activeCount = useMemo(
    () => new Set(inProgress.map((i) => i.track.campaignId)).size,
    [inProgress],
  );

  const featured = useMemo(() => {
    if (inProgress.length > 0) {
      return [...inProgress].sort((a, b) => b.progress.percent - a.progress.percent)[0];
    }
    return items.find((i) => i.track.id === "leitura-jornada-biblica") ?? items[0];
  }, [inProgress, items]);

  const recommended = useMemo(() => {
    const activeCats = new Set(
      inProgress.map((i) => JOURNEY_CATEGORIES.find((c) => c.tracks.some((t) => t.id === i.track.id))?.id),
    );
    const notStarted = items.filter((i) => !i.progress.started);
    const near = notStarted.filter((i) =>
      activeCats.has(JOURNEY_CATEGORIES.find((c) => c.tracks.some((t) => t.id === i.track.id))?.id),
    );
    const rest = notStarted.filter((i) => !near.includes(i));
    const easyFirst = (a: Item, b: Item) =>
      ["Iniciante", "Intermediário", "Avançado"].indexOf(a.track.level) -
      ["Iniciante", "Intermediário", "Avançado"].indexOf(b.track.level);
    return [...near.sort(easyFirst), ...rest.sort(easyFirst)].slice(0, 8);
  }, [inProgress, items]);

  const earned = badges.filter((b) => b.earned).length;
  const displayName =
    (user?.user_metadata as { full_name?: string; name?: string } | undefined)?.full_name ??
    (user?.user_metadata as { name?: string } | undefined)?.name ??
    user?.email?.split("@")[0] ??
    null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Target, label: "Jornadas" }}
        title={`${greetingForNow()}${displayName ? `, ${displayName}` : ""}!`}
        description="Sua biblioteca de jornadas espirituais — calma, profundidade e continuidade."
      />

      <main className="mx-auto max-w-5xl px-4 pt-6">
        <JourneyIntro />

        <div className="space-y-10 pb-6">
          {hydrated ? <Hero item={featured} /> : <HeroSkeleton />}

          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-4 py-2 text-xs text-muted-foreground animate-fade-up">
            <Quote className="size-3.5 shrink-0 text-gold" />
            <span className="truncate italic">{motivation}</span>
          </div>

          {hydrated && inProgress.length > 0 && (
            <TrackRail
              title="Continue sua caminhada"
              icon={<Play className="size-5 text-gold" aria-hidden />}
              items={inProgress}
              size="lg"
            />
          )}

          {hydrated && <WalkSummary
            completed={completedCount}
            active={activeCount}
            streak={summary.currentStreak}
            xp={xp.xp}
            level={xp.level}
            percent={xp.percent}
            earned={earned}
            total={badges.length}
            actMap={actMap}
          />}

          {hydrated && (
            <TrackRail
              title="Recomendado para você"
              icon={<Sparkles className="size-5 text-gold" aria-hidden />}
              items={recommended}
            />
          )}

          <section className="animate-fade-up overflow-hidden rounded-3xl border border-border bg-secondary/40">
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-gold">
                  Inspiração de hoje · {encouragement.kind}
                </div>
                <blockquote className="mt-2 font-serif text-lg text-foreground">"{encouragement.text}"</blockquote>
                <div className="mt-1 text-xs text-muted-foreground">— {encouragement.source}</div>
              </div>
              <Button asChild variant="secondary" className="h-10 shrink-0 rounded-full px-5">
                <Link to="/devocional">
                  Abrir devocional <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </section>

          <section className="animate-fade-up">
            <div className="flex items-center gap-2 px-2">
              <Compass className="size-5 text-gold" aria-hidden />
              <h2 className="font-serif text-xl text-foreground sm:text-2xl">Explore Jornadas</h2>
            </div>
            <p className="mt-1 px-2 text-xs text-muted-foreground">
              Escolha uma categoria para ver todas as jornadas dela.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {JOURNEY_CATEGORIES.map((c) => {
                const Icon = c.icon;
                const started = c.tracks.filter(
                  (t) => trackProgress(t.campaignId, state).started,
                ).length;
                return (
                  <li key={c.id}>
                    <Link
                      to="/campanhas/categoria/$catId"
                      params={{ catId: c.id }}
                      className="group flex h-full items-center gap-3 overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    >
                      <JourneyArt theme={c.theme} className="h-24 w-24 shrink-0" />
                      <div className="min-w-0 flex-1 py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 shrink-0 text-gold" aria-hidden />
                          <h3 className="truncate font-serif text-base text-card-foreground">{c.label}</h3>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.blurb}</p>
                        <div className="mt-2 text-[11px] text-muted-foreground">
                          {c.tracks.length} jornadas
                          {started > 0 && ` · ${started} em andamento`}
                        </div>
                      </div>
                      <ArrowRight className="mr-4 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-gold motion-reduce:transition-none" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

/* ------------------------------ Hero ------------------------------ */

function Hero({ item }: { item: Item }) {
  const { track, progress } = item;
  const { ambient, playing, setAmbient, toggle } = useAmbientAudio();

  const onAmbient = () => {
    if (ambient === "mudo") setAmbient("pads");
    else toggle();
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border shadow-elegant animate-fade-up">
      <JourneyArt theme={track.theme} className="absolute inset-0 size-full" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-black/35"
      />
      <div className="relative p-6 text-hero-foreground sm:p-8 md:p-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-hero-foreground backdrop-blur">
          {progress.started ? <Play className="size-3" /> : <Sparkles className="size-3" />}
          {progress.started ? "Continue sua jornada" : "Jornada em destaque"}
        </div>

        <h2 className="mt-4 max-w-xl font-serif text-3xl leading-tight md:text-4xl">{track.title}</h2>
        <p className="mt-2 max-w-md text-sm text-hero-foreground/85">{track.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
          <span className={`rounded-full px-2.5 py-1 font-semibold uppercase tracking-widest ${LEVEL_CLASSES[track.level]}`}>
            {track.level}
          </span>
          <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">{track.duration}</span>
          {progress.started && (
            <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">{progress.detail}</span>
          )}
        </div>

        {progress.started && progress.percent > 0 && (
          <div
            className="mt-4 h-2 max-w-md overflow-hidden rounded-full bg-white/20"
            role="progressbar"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progresso de ${track.title}`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-white/90 transition-[width] duration-700 motion-reduce:transition-none"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild className="h-11 rounded-full bg-gold px-6 font-semibold text-gold-foreground shadow-soft hover:bg-gold/90">
            <Link to={track.route}>
              {progress.started ? "Continuar" : "Começar jornada"} <ArrowRight className="size-4" />
            </Link>
          </Button>
          <button
            type="button"
            onClick={onAmbient}
            aria-pressed={playing}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 bg-white/15 px-5 text-sm font-medium text-hero-foreground backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {playing ? <Pause className="size-4" /> : <Music2 className="size-4" />}
            {playing ? "Pausar ambiente" : "Ambiente sonoro"}
          </button>
        </div>
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
      <div className="h-4 w-40 rounded-full animate-shimmer" />
      <div className="mt-4 h-8 w-2/3 rounded-lg animate-shimmer" />
      <div className="mt-3 h-4 w-1/2 rounded-full animate-shimmer" />
      <div className="mt-6 h-11 w-40 rounded-full animate-shimmer" />
    </div>
  );
}

/* -------------------------- Sua caminhada -------------------------- */

function WalkSummary({
  completed,
  active,
  streak,
  xp,
  level,
  percent,
  earned,
  total,
  actMap,
}: {
  completed: number;
  active: number;
  streak: number;
  xp: number;
  level: number;
  percent: number;
  earned: number;
  total: number;
  actMap: Map<string, "full" | "partial">;
}) {
  const [openMonth, setOpenMonth] = useState(false);
  return (
    <section className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-serif text-xl text-foreground">
          <TrendingUp className="size-5 text-gold" aria-hidden /> Sua caminhada
        </h2>
        <Link
          to="/caminhada"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline"
        >
          Ver detalhes <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Mini icon={CheckCircle} label="Concluídas" value={String(completed)} />
        <Mini icon={Play} label="Em andamento" value={String(active)} />
        <Mini icon={Flame} label="Sequência" value={`${streak} ${streak === 1 ? "dia" : "dias"}`} accent />
        <Mini icon={Sparkles} label="XP" value={xp.toLocaleString("pt-BR")} accent />
      </dl>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do nível">
          <div className="h-full rounded-full bg-gradient-to-r from-gold to-primary transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Nível {level}</span>
          <span className="inline-flex items-center gap-1">
            <Award className="size-3.5 text-gold" /> {earned} de {total} conquistas
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpenMonth((v) => !v)}
        aria-expanded={openMonth}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CalendarDays className="size-3.5" />
        {openMonth ? "Ocultar meu mês" : "Ver meu mês"}
        <ChevronDown className={`size-3.5 transition-transform ${openMonth ? "rotate-180" : ""}`} />
      </button>
      {openMonth && (
        <div className="mt-4 animate-fade-up">
          <ActivityCalendar map={actMap} />
        </div>
      )}
    </section>
  );
}

function Mini({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-3">
      <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        <Icon className="size-3.5" aria-hidden /> {label}
      </dt>
      <dd className={`mt-1 font-serif text-lg ${accent ? "text-gold" : "text-foreground"}`}>{value}</dd>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  HandHeart,
  Utensils,
  Music,
  GraduationCap,
  Sprout,
  Heart,
  Users,
  Baby,
  Trophy,
} from "lucide-react";
import {
  campaignById,
  computeDateStreak,
  readBiblePlanRaw,
  type CampaignData,
  type CampaignsState,
} from "@/lib/campaigns";

/* ------------------------------------------------------------------ *
 *  Jornadas — a presentation layer over the EXISTING campaign state.  *
 *  No new persistence: every progress number is derived from the      *
 *  campaigns store / bible-plan store already in use.                 *
 * ------------------------------------------------------------------ */

export type JourneyModule = {
  /** existing campaign id (localStorage key inside the campaigns store) */
  campaignId: string;
  title: string;
  description: string;
  route: string;
};

export type Journey = {
  id: string;
  emoji: string;
  icon: LucideIcon;
  title: string;
  synopsis: string;
  /** decorative gradient (design tokens only) */
  art: string;
  featured?: boolean;
  modules: JourneyModule[];
};

const artFor = (a: string, b: string) =>
  `linear-gradient(135deg, color-mix(in oklab, ${a} 88%, transparent) 0%, color-mix(in oklab, ${b} 78%, transparent) 100%)`;

export const JOURNEYS: Journey[] = [
  {
    id: "leitura",
    emoji: "📖",
    icon: BookOpen,
    title: "Leitura Bíblica",
    synopsis:
      "Percorra as Escrituras em uma jornada organizada, acompanhando seu progresso capítulo após capítulo.",
    art: artFor("var(--hero-from)", "var(--hero-to)"),
    featured: true,
    modules: [
      {
        campaignId: "leia-biblia",
        title: "Plano de leitura",
        description: "Do Gênesis ao Apocalipse no seu ritmo.",
        route: "/campanhas/leia-biblia",
      },
    ],
  },
  {
    id: "oracao",
    emoji: "🙏",
    icon: HandHeart,
    title: "Oração",
    synopsis: "Desenvolva uma rotina de oração e fortaleça sua constância diária.",
    art: artFor("var(--primary)", "var(--gold)"),
    featured: true,
    modules: [
      {
        campaignId: "oracao",
        title: "Rotina de Oração",
        description: "Escolha duração, horário e comece.",
        route: "/campanhas/oracao",
      },
    ],
  },
  {
    id: "jejum",
    emoji: "🍞",
    icon: Utensils,
    title: "Jejum",
    synopsis: "Separe dias de entrega e propósito, com acompanhamento do seu jejum.",
    art: artFor("var(--gold)", "var(--hero-to)"),
    modules: [
      {
        campaignId: "jejum",
        title: "Jejum guiado",
        description: "Parcial, de Daniel ou digital — você escolhe.",
        route: "/campanhas/jejum",
      },
    ],
  },
  {
    id: "harpa",
    emoji: "🎵",
    icon: Music,
    title: "Harpa Cristã",
    synopsis: "Adore com os hinos clássicos e avance no desafio da Harpa.",
    art: artFor("var(--hero-to)", "var(--gold)"),
    featured: true,
    modules: [
      {
        campaignId: "harpa-desafio",
        title: "Desafio da Harpa",
        description: "Cante e registre hinos rumo à sua meta.",
        route: "/campanhas/harpa-desafio",
      },
    ],
  },
  {
    id: "conhecimento",
    emoji: "📚",
    icon: GraduationCap,
    title: "Conhecimento Bíblico",
    synopsis: "Aprofunde-se em personagens, temas e ensinos das Escrituras.",
    art: artFor("var(--primary)", "var(--hero-to)"),
    modules: [
      {
        campaignId: "conhecimento",
        title: "Estudo temático",
        description: "Profetas, reis, apóstolos, milagres e parábolas.",
        route: "/campanhas/conhecimento",
      },
      {
        campaignId: "quiz",
        title: "Quiz Bíblico",
        description: "Teste seu conhecimento em quatro níveis.",
        route: "/campanhas/quiz",
      },
    ],
  },
  {
    id: "crescimento",
    emoji: "🌱",
    icon: Sprout,
    title: "Crescimento Espiritual",
    synopsis: "Cultive hábitos diários que formam caráter e comunhão.",
    art: artFor("var(--gold)", "var(--primary)"),
    featured: true,
    modules: [
      {
        campaignId: "devocional-diario",
        title: "Devocional Diário",
        description: "Um momento com Deus todo dia.",
        route: "/campanhas/devocional-diario",
      },
      {
        campaignId: "gratidao",
        title: "Diário de Gratidão",
        description: "Cultive um coração agradecido.",
        route: "/campanhas/gratidao",
      },
      {
        campaignId: "crescimento",
        title: "Fruto do Espírito",
        description: "Amor, bondade, paciência, humildade.",
        route: "/campanhas/crescimento",
      },
    ],
  },
  {
    id: "familia",
    emoji: "👨‍👩‍👧",
    icon: Heart,
    title: "Família",
    synopsis: "Reúna a casa em oração, leitura e adoração.",
    art: artFor("var(--hero-from)", "var(--gold)"),
    modules: [
      {
        campaignId: "familia",
        title: "Culto em Família",
        description: "Um encontro diário com os seus.",
        route: "/campanhas/familia",
      },
    ],
  },
  {
    id: "casais",
    emoji: "💍",
    icon: Users,
    title: "Casais",
    synopsis: "Cresçam juntos na fé, com oração e Palavra a dois.",
    art: artFor("var(--primary)", "var(--hero-from)"),
    modules: [
      {
        campaignId: "casais",
        title: "Oração a dois",
        description: "Oração e leitura em conjunto.",
        route: "/campanhas/casais",
      },
    ],
  },
  {
    id: "criancas",
    emoji: "👧",
    icon: Baby,
    title: "Crianças",
    synopsis: "Histórias e versículos para plantar a Palavra desde cedo.",
    art: artFor("var(--gold)", "var(--hero-from)"),
    modules: [
      {
        campaignId: "criancas",
        title: "Histórias e versículos",
        description: "Uma história por dia para as crianças.",
        route: "/campanhas/criancas",
      },
    ],
  },
  {
    id: "desafios",
    emoji: "🏆",
    icon: Trophy,
    title: "Desafios",
    synopsis: "Metas curtas e intensas para exercitar a fé na prática.",
    art: artFor("var(--hero-to)", "var(--primary)"),
    modules: [
      {
        campaignId: "crescimento",
        title: "Desafios de caráter",
        description: "Sem reclamar, perdão, silêncio e escuta.",
        route: "/campanhas/crescimento",
      },
      {
        campaignId: "harpa-desafio",
        title: "Desafio da Harpa",
        description: "Alcance sua meta de hinos.",
        route: "/campanhas/harpa-desafio",
      },
      {
        campaignId: "quiz",
        title: "Quiz Bíblico",
        description: "Acerte o máximo que conseguir.",
        route: "/campanhas/quiz",
      },
    ],
  },
];

export function journeyById(id: string): Journey | undefined {
  return JOURNEYS.find((j) => j.id === id);
}

/** Which journey a given campaign id belongs to (first match). */
export function journeyForCampaign(campaignId: string): Journey | undefined {
  return JOURNEYS.find((j) => j.modules.some((m) => m.campaignId === campaignId));
}

/* ------------------------ Progress (derived) ------------------------ */

export type ModuleProgress = {
  campaignId: string;
  title: string;
  description: string;
  route: string;
  active: boolean;
  completed: boolean;
  percent: number;
  detail: string;
  updatedAt?: number;
};

function campaignProgress(id: string, c: CampaignData | undefined): {
  percent: number;
  detail: string;
  completed: boolean;
} {
  if (id === "leia-biblia") {
    const plan = readBiblePlanRaw();
    if (!plan.active || !plan.goalDays) return { percent: 0, detail: "Não iniciado", completed: false };
    const cpd = Math.max(1, Math.ceil(1189 / plan.goalDays));
    const done = plan.completedDays?.length ?? 0;
    const chapters = Math.min(1189, done * cpd);
    const percent = Math.min(100, Math.round((chapters / 1189) * 100));
    return {
      percent,
      detail: `${done} de ${plan.goalDays} dias`,
      completed: done >= plan.goalDays,
    };
  }
  if (!c) return { percent: 0, detail: "Não iniciado", completed: false };
  if (c.target) {
    const percent = Math.min(100, Math.round(((c.counter ?? 0) / c.target) * 100));
    return { percent, detail: `${c.counter ?? 0} de ${c.target}`, completed: percent >= 100 };
  }
  if (c.endDate && c.startDate) {
    const total = Math.max(
      1,
      Math.round(
        (new Date(c.endDate + "T00:00:00").getTime() - new Date(c.startDate + "T00:00:00").getTime()) /
          86_400_000,
      ),
    );
    const elapsed = Math.min(
      total,
      Math.max(0, Math.round((Date.now() - new Date(c.startDate + "T00:00:00").getTime()) / 86_400_000)),
    );
    const percent = Math.round((elapsed / total) * 100);
    return { percent, detail: `dia ${Math.min(elapsed + 1, total)} de ${total}`, completed: percent >= 100 };
  }
  if (c.goalDays) {
    const n = c.completedDates?.length ?? 0;
    const percent = Math.min(100, Math.round((n / c.goalDays) * 100));
    return { percent, detail: `${n} de ${c.goalDays} dias`, completed: n >= c.goalDays };
  }
  if (c.correct !== undefined || c.wrong !== undefined) {
    const total = (c.correct ?? 0) + (c.wrong ?? 0);
    const percent = total ? Math.round(((c.correct ?? 0) / total) * 100) : 0;
    return { percent, detail: `${c.correct ?? 0} acertos`, completed: false };
  }
  if (c.completedDates?.length) {
    const streak = computeDateStreak(c.completedDates);
    return { percent: 0, detail: `${streak} ${streak === 1 ? "dia" : "dias"} de sequência`, completed: false };
  }
  if (c.sessions) return { percent: 0, detail: `${c.sessions} sessões`, completed: false };
  return { percent: 0, detail: c.active ? "Em andamento" : "Não iniciado", completed: false };
}

export type JourneyProgress = {
  journey: Journey;
  percent: number;
  active: boolean;
  started: boolean;
  modulesDone: number;
  modulesTotal: number;
  currentModule?: ModuleProgress;
  modules: ModuleProgress[];
  updatedAt: number;
};

export function journeyProgress(journey: Journey, state: CampaignsState): JourneyProgress {
  const modules: ModuleProgress[] = journey.modules.map((m) => {
    const c = state[m.campaignId];
    const p = campaignProgress(m.campaignId, c);
    const planActive = m.campaignId === "leia-biblia" ? !!readBiblePlanRaw().active : false;
    const meta = campaignById(m.campaignId);
    return {
      campaignId: m.campaignId,
      title: m.title,
      description: m.description,
      route: meta?.route ?? m.route,
      active: !!c?.active || planActive,
      completed: p.completed,
      percent: p.percent,
      detail: p.detail,
      updatedAt: c?.updatedAt,
    };
  });

  const modulesTotal = modules.length;
  const modulesDone = modules.filter((m) => m.completed).length;
  const percent = modulesTotal
    ? Math.min(100, Math.round(modules.reduce((s, m) => s + m.percent, 0) / modulesTotal))
    : 0;
  const active = modules.some((m) => m.active);
  const started = active || modules.some((m) => m.percent > 0);
  const currentModule =
    modules.find((m) => m.active && !m.completed) ?? modules.find((m) => !m.completed) ?? modules[0];
  const updatedAt = modules.reduce((s, m) => Math.max(s, m.updatedAt ?? 0), 0);

  return { journey, percent, active, started, modulesDone, modulesTotal, currentModule, modules, updatedAt };
}

export function allJourneyProgress(state: CampaignsState): JourneyProgress[] {
  return JOURNEYS.map((j) => journeyProgress(j, state));
}

/** The journey the user most recently interacted with (or has progress in). */
export function continueJourney(state: CampaignsState): JourneyProgress | undefined {
  const started = allJourneyProgress(state).filter((j) => j.started);
  if (started.length === 0) return undefined;
  return started.sort((a, b) => b.updatedAt - a.updatedAt || b.percent - a.percent)[0];
}

/* ------------------------ Motivational lines ------------------------ */

export const JOURNEY_MOTIVATIONS: string[] = [
  "Continue. Cada capítulo é um passo.",
  "Sua caminhada continua hoje.",
  "Pequenos passos também levam longe.",
  "Permaneça constante.",
  "Um dia de cada vez, com fé.",
  "A fidelidade se constrói na rotina.",
  "Recomeçar também é caminhar.",
];

export function randomMotivation(): string {
  return JOURNEY_MOTIVATIONS[Math.floor(Math.random() * JOURNEY_MOTIVATIONS.length)];
}

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

/* ------------------------------------------------------------------ *
 *  Catálogo de Jornadas — camada de APRESENTAÇÃO.                     *
 *  Cada trilha aponta para uma campanha que JÁ EXISTE (campaignId +   *
 *  rota). Não há novo armazenamento: progresso, XP, histórico e       *
 *  conquistas continuam vindo do store de campanhas.                  *
 * ------------------------------------------------------------------ */

export type Level = "Iniciante" | "Intermediário" | "Avançado";

export type ArtTheme =
  | "biblia"
  | "oracao"
  | "jejum"
  | "harpa"
  | "conhecimento"
  | "crescimento"
  | "familia"
  | "casais"
  | "criancas"
  | "desafios";

export type Track = {
  /** id único apenas para renderização/rotas de leitura */
  id: string;
  title: string;
  description: string;
  level: Level;
  duration: string;
  /** campanha real (única fonte de progresso) */
  campaignId: string;
  route: string;
  theme: ArtTheme;
};

export type JourneyCategory = {
  id: string;
  label: string;
  blurb: string;
  icon: LucideIcon;
  theme: ArtTheme;
  tracks: Track[];
};

export const JOURNEY_CATEGORIES: JourneyCategory[] = [
  {
    id: "leitura",
    label: "Leitura Bíblica",
    blurb: "Percorra as Escrituras no seu ritmo.",
    icon: BookOpen,
    theme: "biblia",
    tracks: [
      { id: "leitura-jornada-biblica", title: "Jornada Bíblica", description: "Caminhe por etapas do Pentateuco ao Apocalipse.", level: "Avançado", duration: "1.189 capítulos", campaignId: "jornada-biblica", route: "/campanhas/jornada-biblica", theme: "biblia" },
      { id: "leitura-toda-biblia", title: "Ler toda a Bíblia", description: "Do Gênesis ao Apocalipse no seu ritmo.", level: "Avançado", duration: "365 dias", campaignId: "leia-biblia", route: "/campanhas/leia-biblia", theme: "biblia" },
      { id: "leitura-nt", title: "Novo Testamento", description: "Do Evangelho de Mateus ao Apocalipse.", level: "Intermediário", duration: "90 dias", campaignId: "leia-biblia", route: "/campanhas/leia-biblia", theme: "biblia" },
      { id: "leitura-evangelhos", title: "Evangelhos", description: "Mateus, Marcos, Lucas e João.", level: "Iniciante", duration: "40 dias", campaignId: "leia-biblia", route: "/campanhas/leia-biblia", theme: "biblia" },
      { id: "leitura-salmos", title: "Salmos", description: "Um salmo por dia para meditar.", level: "Iniciante", duration: "150 dias", campaignId: "leia-biblia", route: "/campanhas/leia-biblia", theme: "biblia" },
      { id: "leitura-proverbios", title: "Provérbios", description: "Sabedoria diária de Salomão.", level: "Iniciante", duration: "31 dias", campaignId: "leia-biblia", route: "/campanhas/leia-biblia", theme: "biblia" },
    ],
  },
  {
    id: "oracao",
    label: "Oração",
    blurb: "Constância diante de Deus, um dia por vez.",
    icon: HandHeart,
    theme: "oracao",
    tracks: [
      { id: "oracao-rotina", title: "Rotina de Oração", description: "Escolha duração, horário e comece.", level: "Iniciante", duration: "diário", campaignId: "oracao", route: "/campanhas/oracao", theme: "oracao" },
      { id: "oracao-21", title: "21 Dias de Oração", description: "Formando um hábito espiritual.", level: "Intermediário", duration: "21 dias", campaignId: "oracao", route: "/campanhas/oracao", theme: "oracao" },
      { id: "oracao-40", title: "40 Dias de Oração", description: "Uma jornada profunda de fé.", level: "Avançado", duration: "40 dias", campaignId: "oracao", route: "/campanhas/oracao", theme: "oracao" },
    ],
  },
  {
    id: "jejum",
    label: "Jejum",
    blurb: "Dias de entrega, silêncio e propósito.",
    icon: Utensils,
    theme: "jejum",
    tracks: [
      { id: "jejum-parcial", title: "Jejum Parcial", description: "Renovação através do jejum leve.", level: "Iniciante", duration: "7 dias", campaignId: "jejum", route: "/campanhas/jejum", theme: "jejum" },
      { id: "jejum-daniel", title: "Jejum de Daniel", description: "Alimentação simples e oração.", level: "Intermediário", duration: "21 dias", campaignId: "jejum", route: "/campanhas/jejum", theme: "jejum" },
      { id: "jejum-redes", title: "Jejum de Redes Sociais", description: "Silêncio digital para ouvir a Deus.", level: "Iniciante", duration: "14 dias", campaignId: "jejum", route: "/campanhas/jejum", theme: "jejum" },
    ],
  },
  {
    id: "harpa",
    label: "Harpa Cristã",
    blurb: "Adoração com os hinos clássicos.",
    icon: Music,
    theme: "harpa",
    tracks: [
      { id: "harpa-30", title: "30 Hinos", description: "Comece devagar.", level: "Iniciante", duration: "30 hinos", campaignId: "harpa-desafio", route: "/campanhas/harpa-desafio", theme: "harpa" },
      { id: "harpa-50", title: "50 Hinos", description: "Adoração diária com clássicos.", level: "Iniciante", duration: "50 hinos", campaignId: "harpa-desafio", route: "/campanhas/harpa-desafio", theme: "harpa" },
      { id: "harpa-100", title: "100 Hinos", description: "Aprofunde-se no cancioneiro.", level: "Intermediário", duration: "100 hinos", campaignId: "harpa-desafio", route: "/campanhas/harpa-desafio", theme: "harpa" },
      { id: "harpa-640", title: "Toda a Harpa", description: "Cante todos os 640 hinos.", level: "Avançado", duration: "640 hinos", campaignId: "harpa-desafio", route: "/campanhas/harpa-desafio", theme: "harpa" },
    ],
  },
  {
    id: "conhecimento",
    label: "Conhecimento Bíblico",
    blurb: "Personagens, ensinos e memória das Escrituras.",
    icon: GraduationCap,
    theme: "conhecimento",
    tracks: [
      { id: "conhecimento-personagens", title: "Personagens Bíblicos", description: "Vidas que marcaram a história.", level: "Intermediário", duration: "30 dias", campaignId: "conhecimento", route: "/campanhas/conhecimento", theme: "conhecimento" },
      { id: "conhecimento-grupos", title: "Profetas, Reis, Apóstolos", description: "Estude cada grupo em profundidade.", level: "Intermediário", duration: "21 dias", campaignId: "conhecimento", route: "/campanhas/conhecimento", theme: "conhecimento" },
      { id: "conhecimento-milagres", title: "Milagres e Parábolas", description: "As obras e ensinos do Senhor.", level: "Iniciante", duration: "14 dias", campaignId: "conhecimento", route: "/campanhas/conhecimento", theme: "conhecimento" },
      { id: "conhecimento-quiz", title: "Quiz Bíblico", description: "Teste seu conhecimento em quatro níveis.", level: "Intermediário", duration: "diário", campaignId: "quiz", route: "/campanhas/quiz", theme: "conhecimento" },
    ],
  },
  {
    id: "crescimento",
    label: "Crescimento Espiritual",
    blurb: "Hábitos diários que formam caráter.",
    icon: Sprout,
    theme: "crescimento",
    tracks: [
      { id: "crescimento-devocional", title: "Devocional Diário", description: "Um momento com Deus todo dia.", level: "Iniciante", duration: "30 dias", campaignId: "devocional-diario", route: "/campanhas/devocional-diario", theme: "crescimento" },
      { id: "crescimento-gratidao", title: "Gratidão", description: "Cultive um coração agradecido.", level: "Iniciante", duration: "21 dias", campaignId: "gratidao", route: "/campanhas/gratidao", theme: "crescimento" },
      { id: "crescimento-fruto", title: "Fruto do Espírito", description: "Amor, bondade, paciência, humildade.", level: "Intermediário", duration: "40 dias", campaignId: "crescimento", route: "/campanhas/crescimento", theme: "crescimento" },
    ],
  },
  {
    id: "familia",
    label: "Família",
    blurb: "Reúna a casa em oração e Palavra.",
    icon: Heart,
    theme: "familia",
    tracks: [
      { id: "familia-culto", title: "Culto em Família", description: "Reúna a casa em oração diária.", level: "Iniciante", duration: "30 dias", campaignId: "familia", route: "/campanhas/familia", theme: "familia" },
      { id: "familia-bencao", title: "Bênção dos Filhos", description: "Ore por cada filho todos os dias.", level: "Iniciante", duration: "21 dias", campaignId: "familia", route: "/campanhas/familia", theme: "familia" },
    ],
  },
  {
    id: "casais",
    label: "Casais",
    blurb: "Cresçam juntos na fé, a dois.",
    icon: Users,
    theme: "casais",
    tracks: [
      { id: "casais-oracao", title: "Oração a Dois", description: "Uma oração diária com o cônjuge.", level: "Iniciante", duration: "30 dias", campaignId: "casais", route: "/campanhas/casais", theme: "casais" },
      { id: "casais-cantares", title: "Cantares", description: "Leiam Cantares juntos e reflitam.", level: "Iniciante", duration: "8 dias", campaignId: "casais", route: "/campanhas/casais", theme: "casais" },
    ],
  },
  {
    id: "criancas",
    label: "Crianças",
    blurb: "A Palavra plantada desde cedo.",
    icon: Baby,
    theme: "criancas",
    tracks: [
      { id: "criancas-historias", title: "Histórias Bíblicas", description: "Uma história por dia para as crianças.", level: "Iniciante", duration: "30 dias", campaignId: "criancas", route: "/campanhas/criancas", theme: "criancas" },
      { id: "criancas-versiculos", title: "Versículos para Memorizar", description: "Palavra guardada no coração.", level: "Iniciante", duration: "21 dias", campaignId: "criancas", route: "/campanhas/criancas", theme: "criancas" },
    ],
  },
  {
    id: "desafios",
    label: "Desafios",
    blurb: "Metas curtas e intensas para a fé na prática.",
    icon: Trophy,
    theme: "desafios",
    tracks: [
      { id: "desafios-sem-reclamar", title: "Sem Reclamar", description: "21 dias sem uma única reclamação.", level: "Avançado", duration: "21 dias", campaignId: "crescimento", route: "/campanhas/crescimento", theme: "desafios" },
      { id: "desafios-perdao", title: "Perdão", description: "Perdoe uma pessoa por dia.", level: "Avançado", duration: "7 dias", campaignId: "crescimento", route: "/campanhas/crescimento", theme: "desafios" },
      { id: "desafios-silencio", title: "Silêncio e Escuta", description: "Ouça mais, fale menos.", level: "Intermediário", duration: "14 dias", campaignId: "crescimento", route: "/campanhas/crescimento", theme: "desafios" },
      { id: "desafios-harpa", title: "Desafio da Harpa", description: "Alcance sua meta de hinos.", level: "Intermediário", duration: "sua meta", campaignId: "harpa-desafio", route: "/campanhas/harpa-desafio", theme: "harpa" },
    ],
  },
];

export function categoryById(id: string): JourneyCategory | undefined {
  return JOURNEY_CATEGORIES.find((c) => c.id === id);
}

export const ALL_TRACKS: Track[] = JOURNEY_CATEGORIES.flatMap((c) => c.tracks);

export function trackById(id: string): Track | undefined {
  return ALL_TRACKS.find((t) => t.id === id);
}

export const LEVEL_CLASSES: Record<Level, string> = {
  Iniciante: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Intermediário: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Avançado: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

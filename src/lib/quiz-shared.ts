/* Client-safe quiz metadata. The question bank itself lives server-side
 * (src/lib/quiz-bank.server.ts) so correct answers are never shipped to the
 * browser — grading happens in a server function. */

export type QuizAudience = "adultos" | "kids";
export type QuizDifficulty = "facil" | "medio" | "dificil";

export const AUDIENCES: { id: QuizAudience; emoji: string; label: string; description: string }[] = [
  {
    id: "adultos",
    emoji: "👨",
    label: "Adultos",
    description: "Perguntas aprofundadas sobre toda a Escritura.",
  },
  {
    id: "kids",
    emoji: "👦",
    label: "Kids",
    description: "Histórias e personagens em linguagem simples e clara.",
  },
];

export const DIFFICULTIES: { id: QuizDifficulty; emoji: string; label: string }[] = [
  { id: "facil", emoji: "🟢", label: "Fácil" },
  { id: "medio", emoji: "🟡", label: "Médio" },
  { id: "dificil", emoji: "🔴", label: "Difícil" },
];

export function difficultyLabel(d: QuizDifficulty): string {
  return DIFFICULTIES.find((x) => x.id === d)?.label ?? d;
}

export function difficultyEmoji(d: QuizDifficulty): string {
  return DIFFICULTIES.find((x) => x.id === d)?.emoji ?? "🟢";
}

export type QuizCategoryMeta = {
  id: string;
  audience: QuizAudience;
  emoji: string;
  label: string;
  description: string;
};

/** Expansible registry — adding a category here + questions in the bank is enough. */
export const QUIZ_CATEGORIES: QuizCategoryMeta[] = [
  { id: "biblia-geral", audience: "adultos", emoji: "📖", label: "Bíblia Geral", description: "Visão geral das Escrituras." },
  { id: "antigo-testamento", audience: "adultos", emoji: "📜", label: "Antigo Testamento", description: "Da criação aos profetas." },
  { id: "novo-testamento", audience: "adultos", emoji: "✝️", label: "Novo Testamento", description: "Evangelhos, Atos e cartas." },
  { id: "personagens", audience: "adultos", emoji: "👥", label: "Personagens Bíblicos", description: "Vidas que marcaram a história." },
  { id: "reis", audience: "adultos", emoji: "👑", label: "Reis de Israel e Judá", description: "A monarquia e seus reinados." },
  { id: "juizes", audience: "adultos", emoji: "⚔️", label: "Juízes de Israel", description: "Libertadores levantados por Deus." },
  { id: "profetas", audience: "adultos", emoji: "🔥", label: "Profetas", description: "Mensageiros da voz do Senhor." },
  { id: "jesus", audience: "adultos", emoji: "✝️", label: "Vida e Ministério de Jesus", description: "Do nascimento à ressurreição." },
  { id: "apostolos", audience: "adultos", emoji: "👨‍🦱", label: "Apóstolos", description: "Os enviados e a igreja primitiva." },
  { id: "geografia", audience: "adultos", emoji: "🌍", label: "Geografia Bíblica", description: "Lugares, montes, rios e cidades." },
  { id: "livros", audience: "adultos", emoji: "📚", label: "Livros da Bíblia", description: "Estrutura e curiosidades do cânon." },
  { id: "avancado", audience: "adultos", emoji: "🧠", label: "Conhecimento Avançado", description: "Detalhes para quem estuda a fundo." },
  { id: "historias", audience: "kids", emoji: "🌱", label: "Histórias da Bíblia", description: "As histórias mais amadas." },
  { id: "personagens-kids", audience: "kids", emoji: "🦁", label: "Personagens", description: "Quem é quem na Bíblia." },
  { id: "animais", audience: "kids", emoji: "🐳", label: "Animais da Bíblia", description: "Bichos que aparecem na Palavra." },
  { id: "aventuras", audience: "kids", emoji: "⛵", label: "Aventuras Bíblicas", description: "Momentos incríveis da Bíblia." },
  { id: "reis-herois", audience: "kids", emoji: "👑", label: "Reis e Heróis", description: "Gente corajosa que confiou em Deus." },
  { id: "jesus-kids", audience: "kids", emoji: "✝️", label: "Jesus", description: "A vida de Jesus para crianças." },
  { id: "oracao", audience: "kids", emoji: "🙏", label: "Oração", description: "Conversar com Deus." },
  { id: "amor", audience: "kids", emoji: "❤️", label: "Amor e Bondade", description: "O amor de Deus e o cuidado com o próximo." },
  { id: "conhecendo", audience: "kids", emoji: "📖", label: "Conhecendo a Bíblia", description: "Como a Bíblia é organizada." },
];

export function categoryMeta(id: string): QuizCategoryMeta | undefined {
  return QUIZ_CATEGORIES.find((c) => c.id === id);
}

export function categoriesFor(audience: QuizAudience): QuizCategoryMeta[] {
  return QUIZ_CATEGORIES.filter((c) => c.audience === audience);
}

/** Points shown inside the quiz (performance only — never a second XP curve). */
export const POINTS_PER_CORRECT = 10;
export const QUESTIONS_PER_QUIZ = 10;

/** Question as it reaches the browser: no correct answer, no explanation. */
export type ClientQuestion = {
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: QuizDifficulty;
  reference?: string;
  book?: string;
  chapter?: number;
};

export type GradedAnswer = {
  id: string;
  question: string;
  options: string[];
  chosen: number;
  answer: number;
  isCorrect: boolean;
  explanation: string;
  reference?: string;
  book?: string;
  chapter?: number;
};

export type QuizResult = {
  quizKey: string;
  total: number;
  correct: number;
  percent: number;
  points: number;
  xpEligible: boolean;
  xpAwarded: number;
  answers: GradedAnswer[];
};

export function todayKeyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function hashKey(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** "Quiz do Dia": same pick for everyone, renewed at every date change. */
export function quizOfTheDay(audience: QuizAudience): { category: QuizCategoryMeta; difficulty: QuizDifficulty } {
  const list = categoriesFor(audience);
  const seed = hashKey(`${audience}:${todayKeyISO()}`);
  const category = list[seed % list.length]!;
  const difficulty = DIFFICULTIES[(seed >>> 8) % DIFFICULTIES.length]!.id;
  return { category, difficulty };
}

export type QuizAchievement = { id: string; emoji: string; label: string; description: string; unlocked: boolean };

export function quizAchievements(stats: {
  attempts: number;
  totalCorrect: number;
  accuracy: number;
  bestPercent: number;
}): QuizAchievement[] {
  return [
    { id: "primeiro-quiz", emoji: "🎯", label: "Primeiro Quiz", description: "Conclua o seu primeiro quiz.", unlocked: stats.attempts >= 1 },
    { id: "dez-quizzes", emoji: "🧠", label: "Estudioso", description: "Conclua 10 quizzes.", unlocked: stats.attempts >= 10 },
    { id: "cem-acertos", emoji: "📚", label: "Cem Acertos", description: "Acerte 100 perguntas no total.", unlocked: stats.totalCorrect >= 100 },
    { id: "gabarito", emoji: "🏆", label: "Gabarito", description: "Faça 100% em um quiz.", unlocked: stats.bestPercent >= 100 },
    { id: "precisao", emoji: "🎖️", label: "Precisão", description: "Mantenha 80% de aproveitamento geral.", unlocked: stats.accuracy >= 80 && stats.attempts >= 3 },
  ];
}
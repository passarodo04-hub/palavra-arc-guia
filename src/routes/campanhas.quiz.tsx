import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Brain, CheckCircle2, XCircle, Flame, Trophy, RotateCcw } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/campaigns/StatCard";
import { VerseCard } from "@/components/campaigns/VerseCard";
import { useCampaign, verseForDay } from "@/lib/campaigns";

export const Route = createFileRoute("/campanhas/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz Bíblico — Campanhas — Palavra+" },
      { name: "description", content: "Teste o seu conhecimento das Escrituras em diferentes níveis de dificuldade." },
    ],
  }),
  component: QuizPage,
});

type Q = { q: string; options: string[]; answer: number };
type Difficulty = "Fácil" | "Médio" | "Difícil" | "Especialista";

const BANK: Record<Difficulty, Q[]> = {
  Fácil: [
    { q: "Quem construiu a arca?", options: ["Moisés", "Noé", "Abraão", "Davi"], answer: 1 },
    { q: "Em quantos dias Deus criou o mundo?", options: ["5", "6", "7", "10"], answer: 1 },
    { q: "Quem enfrentou Golias?", options: ["Sansão", "Saul", "Davi", "Jônatas"], answer: 2 },
    { q: "Quantos discípulos Jesus escolheu?", options: ["7", "10", "12", "70"], answer: 2 },
    { q: "Onde Jesus nasceu?", options: ["Nazaré", "Jerusalém", "Belém", "Cafarnaum"], answer: 2 },
  ],
  Médio: [
    { q: "Quem sucedeu Moisés?", options: ["Arão", "Josué", "Calebe", "Samuel"], answer: 1 },
    { q: "Quem foi jogado na cova dos leões?", options: ["Daniel", "José", "Elias", "Isaías"], answer: 0 },
    { q: "Quem escreveu a maior parte dos Salmos?", options: ["Salomão", "Davi", "Asafe", "Moisés"], answer: 1 },
    { q: "Quantos livros tem o Novo Testamento?", options: ["27", "39", "66", "22"], answer: 0 },
    { q: "Quem batizou Jesus?", options: ["Pedro", "João Batista", "André", "Paulo"], answer: 1 },
  ],
  Difícil: [
    { q: "Quem foi o primeiro rei de Israel?", options: ["Davi", "Saul", "Salomão", "Samuel"], answer: 1 },
    { q: "Qual profeta foi levado ao céu num carro de fogo?", options: ["Elias", "Eliseu", "Ezequiel", "Enoque"], answer: 0 },
    { q: "Onde Paulo escreveu boa parte de suas cartas?", options: ["Antioquia", "Prisão", "Éfeso", "Corinto"], answer: 1 },
    { q: "Quem traiu Jesus por 30 moedas?", options: ["Pedro", "Judas Iscariotes", "Tomé", "Tadeu"], answer: 1 },
    { q: "Quantos anos os israelitas peregrinaram no deserto?", options: ["7", "12", "40", "70"], answer: 2 },
  ],
  Especialista: [
    { q: "Qual é o livro mais curto do NT?", options: ["3 João", "Judas", "Filemom", "2 João"], answer: 3 },
    { q: "Quem substituiu Judas entre os apóstolos?", options: ["Matias", "Silas", "Barnabé", "Estêvão"], answer: 0 },
    { q: "Qual profeta casou com Gômer?", options: ["Amós", "Miquéias", "Oséias", "Joel"], answer: 2 },
    { q: "Em qual monte Elias enfrentou os profetas de Baal?", options: ["Sinai", "Carmelo", "Horebe", "Tabor"], answer: 1 },
    { q: "Qual é o livro que não menciona o nome de Deus?", options: ["Rute", "Ester", "Cantares", "Eclesiastes"], answer: 1 },
  ],
};

const DIFFICULTIES: Difficulty[] = ["Fácil", "Médio", "Difícil", "Especialista"];

function QuizPage() {
  const { data, patch, reset } = useCampaign("quiz");
  const [difficulty, setDifficulty] = useState<Difficulty>((data.difficulty as Difficulty) ?? "Fácil");
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const question = useMemo(() => BANK[difficulty][idx % BANK[difficulty].length], [difficulty, idx]);

  const total = (data.correct ?? 0) + (data.wrong ?? 0);
  const accuracy = total ? Math.round(((data.correct ?? 0) / total) * 100) : 0;
  const v = verseForDay(6);

  function answer(i: number) {
    if (selected !== null) return;
    setSelected(i);
    const isRight = i === question.answer;
    const cs = (data.currentStreak ?? 0) + (isRight ? 1 : 0);
    patch({
      active: true,
      difficulty,
      correct: (data.correct ?? 0) + (isRight ? 1 : 0),
      wrong: (data.wrong ?? 0) + (isRight ? 0 : 1),
      currentStreak: isRight ? cs : 0,
      bestStreak: Math.max(data.bestStreak ?? 0, isRight ? cs : 0),
    });
  }
  function next() {
    setSelected(null);
    setIdx((n) => n + 1);
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Brain, label: "Campanha" }}
        title="Quiz Bíblico"
        description="Teste o seu conhecimento das Escrituras — escolha a dificuldade e comece."
        backTo="/campanhas"
        backLabel="Campanhas"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Dificuldade</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDifficulty(d);
                  setIdx(0);
                  setSelected(null);
                }}
                className={`rounded-full border px-4 py-2 text-sm ${
                  difficulty === d ? "border-gold bg-gold/10 text-foreground" : "border-border bg-secondary/40 text-muted-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-elegant animate-fade-up">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Pergunta</div>
          <h2 className="mt-2 font-serif text-xl text-card-foreground">{question.q}</h2>
          <div className="mt-4 grid gap-2">
            {question.options.map((opt, i) => {
              const isCorrect = i === question.answer;
              const state =
                selected === null
                  ? "border-border bg-secondary/40 hover:border-gold/40"
                  : isCorrect
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : i === selected
                      ? "border-rose-500/50 bg-rose-500/10"
                      : "border-border bg-secondary/40 opacity-60";
              return (
                <button
                  key={i}
                  type="button"
                  disabled={selected !== null}
                  onClick={() => answer(i)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${state}`}
                >
                  <span>{opt}</span>
                  {selected !== null && isCorrect && <CheckCircle2 className="size-4 text-emerald-600" />}
                  {selected === i && !isCorrect && <XCircle className="size-4 text-rose-600" />}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <div className="mt-4">
              <Button onClick={next} className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90 h-10 px-5">
                Próxima pergunta
              </Button>
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up">
          <StatCard icon={CheckCircle2} label="Acertos" value={String(data.correct ?? 0)} accent />
          <StatCard icon={XCircle} label="Erros" value={String(data.wrong ?? 0)} />
          <StatCard icon={Trophy} label="Precisão" value={`${accuracy}%`} />
          <StatCard icon={Flame} label="Sequência" value={`${data.currentStreak ?? 0} · máx ${data.bestStreak ?? 0}`} />
        </section>

        <VerseCard text={v.text} ref={v.ref} />

        <section className="rounded-3xl border border-border bg-secondary/40 p-6 flex items-center justify-between animate-fade-up">
          <div className="text-xs text-muted-foreground">Zerar pontuação?</div>
          <Button variant="ghost" size="sm" className="rounded-full" onClick={() => confirm("Zerar quiz?") && reset()}>
            <RotateCcw className="size-4" /> Reiniciar
          </Button>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
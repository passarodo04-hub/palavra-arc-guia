import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, CheckCircle2, Circle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { StatCard } from "@/components/campaigns/StatCard";
import { CircularProgress } from "@/components/campaigns/CircularProgress";
import { VerseCard } from "@/components/campaigns/VerseCard";
import { useCampaign, verseForDay } from "@/lib/campaigns";

export const Route = createFileRoute("/campanhas/conhecimento")({
  head: () => ({
    meta: [
      { title: "Conhecimento Bíblico — Campanhas — Palavra+" },
      { name: "description", content: "Explore personagens, milagres, parábolas, profetas, reis, mulheres e apóstolos da Bíblia." },
    ],
  }),
  component: ConhecimentoPage,
});

type Topic = { id: string; label: string; description: string; items: string[] };

const TOPICS: Topic[] = [
  {
    id: "personagens",
    label: "Personagens",
    description: "Vidas que marcaram a história da salvação.",
    items: ["Abraão", "Moisés", "Davi", "Elias", "Daniel", "Ester", "Paulo", "Pedro"],
  },
  {
    id: "milagres",
    label: "Milagres",
    description: "As obras extraordinárias do Senhor.",
    items: ["Mar Vermelho", "Maná", "Ressurreição de Lázaro", "Multiplicação dos pães", "Cura do cego", "Água em vinho"],
  },
  {
    id: "parabolas",
    label: "Parábolas",
    description: "As histórias que Jesus contou.",
    items: ["Filho pródigo", "Bom samaritano", "Semeador", "Ovelha perdida", "Talentos", "Fariseu e publicano"],
  },
  {
    id: "profetas",
    label: "Profetas",
    description: "Mensageiros da voz de Deus.",
    items: ["Isaías", "Jeremias", "Ezequiel", "Daniel", "Oséias", "Amós", "Miquéias", "Malaquias"],
  },
  {
    id: "reis",
    label: "Reis",
    description: "A monarquia de Israel e Judá.",
    items: ["Saul", "Davi", "Salomão", "Ezequias", "Josias", "Jeroboão"],
  },
  {
    id: "mulheres",
    label: "Mulheres da Bíblia",
    description: "Mulheres de fé e coragem.",
    items: ["Sara", "Rute", "Ester", "Débora", "Maria", "Marta", "Priscila", "Lídia"],
  },
  {
    id: "apostolos",
    label: "Apóstolos",
    description: "Os enviados do Senhor.",
    items: ["Pedro", "João", "Tiago", "André", "Filipe", "Bartolomeu", "Mateus", "Tomé", "Paulo"],
  },
];

function ConhecimentoPage() {
  const { data, patch } = useCampaign("conhecimento");
  const sub = data.subGoals ?? {};

  const total = TOPICS.reduce((n, t) => n + t.items.length, 0);
  const done = Object.values(sub).filter(Boolean).length;
  const percent = Math.round((done / total) * 100);
  const v = verseForDay(5);

  const toggle = (topic: string, item: string) => {
    const key = `${topic}:${item}`;
    patch({ active: true, subGoals: { ...sub, [key]: !sub[key] } });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: GraduationCap, label: "Campanha" }}
        title="Conhecimento Bíblico"
        description="Aprofunde-se em personagens, milagres, parábolas e temas centrais das Escrituras."
        backTo="/campanhas"
        backLabel="Campanhas"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-elegant animate-fade-up">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <CircularProgress percent={percent} />
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-widest text-gold">Progresso geral</div>
              <h2 className="mt-1 font-serif text-2xl">{done} de {total}</h2>
              <p className="text-sm text-muted-foreground">Marque cada item que você estudar.</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={GraduationCap} label="Temas" value={String(TOPICS.length)} />
          <StatCard icon={CheckCircle2} label="Concluídos" value={String(done)} accent />
          <StatCard icon={Circle} label="Restantes" value={String(total - done)} />
          <StatCard icon={CheckCircle2} label="Progresso" value={`${percent}%`} />
        </section>

        <div className="space-y-4">
          {TOPICS.map((t) => {
            const topicDone = t.items.filter((i) => sub[`${t.id}:${i}`]).length;
            return (
              <section key={t.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-card-foreground">{t.label}</h3>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{topicDone}/{t.items.length}</div>
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {t.items.map((item) => {
                    const active = !!sub[`${t.id}:${item}`];
                    return (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => toggle(t.id, item)}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                            active ? "border-gold bg-gold/10 text-foreground" : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/40"
                          }`}
                        >
                          {active ? <CheckCircle2 className="size-3.5 text-gold" /> : <Circle className="size-3.5" />}
                          {item}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        <VerseCard text={v.text} ref={v.ref} />
      </main>
      <BottomNav />
    </div>
  );
}
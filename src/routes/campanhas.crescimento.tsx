import { createFileRoute } from "@tanstack/react-router";
import { Sprout, CheckCircle2, Circle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { StatCard } from "@/components/campaigns/StatCard";
import { CircularProgress } from "@/components/campaigns/CircularProgress";
import { VerseCard } from "@/components/campaigns/VerseCard";
import { useCampaign, verseForDay } from "@/lib/campaigns";

export const Route = createFileRoute("/campanhas/crescimento")({
  head: () => ({
    meta: [
      { title: "Crescimento Espiritual — Campanhas — Palavra+" },
      { name: "description", content: "Pequenos desafios diários para cultivar o fruto do Espírito." },
    ],
  }),
  component: CrescimentoPage,
});

type Track = { id: string; label: string; verse: string; challenges: string[] };

const TRACKS: Track[] = [
  { id: "bondade", label: "Bondade", verse: "Ef 4:32", challenges: ["Ajude alguém sem esperar retorno", "Envie uma palavra de ânimo", "Faça um elogio sincero", "Ceda a vez a alguém", "Ore por um desconhecido"] },
  { id: "perdao", label: "Perdão", verse: "Cl 3:13", challenges: ["Ore por quem te feriu", "Escreva uma carta de perdão (não precisa enviar)", "Peça perdão a alguém", "Solte uma mágoa em oração"] },
  { id: "amor", label: "Amor", verse: "1 Co 13", challenges: ["Sirva sua família em silêncio", "Ligue para um familiar", "Passe tempo de qualidade com alguém", "Faça algo bom sem contar"] },
  { id: "humildade", label: "Humildade", verse: "Fp 2:3", challenges: ["Ouça sem interromper", "Reconheça um erro", "Aceite ajuda", "Faça uma tarefa simples com alegria"] },
  { id: "paciencia", label: "Paciência", verse: "Tg 1:19", challenges: ["Respire antes de responder", "Fique 24h sem reclamar", "Espere sem ansiedade", "Aceite atrasos com paz"] },
  { id: "fe", label: "Fé", verse: "Hb 11:1", challenges: ["Confesse uma promessa", "Ore por um pedido antigo", "Testemunhe de Cristo", "Confie em Deus numa decisão"] },
  { id: "esperanca", label: "Esperança", verse: "Rm 15:13", challenges: ["Leia salmos de louvor", "Reflita sobre uma bênção", "Encoraje alguém desanimado"] },
  { id: "generosidade", label: "Generosidade", verse: "2 Co 9:7", challenges: ["Doe algo em bom estado", "Contribua com uma causa", "Ofereça seu tempo", "Compartilhe uma refeição"] },
];

function CrescimentoPage() {
  const { data, patch } = useCampaign("crescimento");
  const sub = data.subGoals ?? {};
  const total = TRACKS.reduce((n, t) => n + t.challenges.length, 0);
  const done = Object.values(sub).filter(Boolean).length;
  const percent = Math.round((done / total) * 100);
  const v = verseForDay(8);

  const toggle = (t: string, c: string) => {
    const key = `${t}:${c}`;
    patch({ active: true, subGoals: { ...sub, [key]: !sub[key] } });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Sprout, label: "Campanha" }}
        title="Crescimento Espiritual"
        description="Cultive o fruto do Espírito com pequenos desafios diários em cada área da sua vida."
        backTo="/campanhas"
        backLabel="Campanhas"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-elegant animate-fade-up">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <CircularProgress percent={percent} />
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-widest text-gold">Progresso</div>
              <h2 className="mt-1 font-serif text-2xl">{done} de {total}</h2>
              <p className="text-sm text-muted-foreground">Marque cada desafio conforme praticar.</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Sprout} label="Áreas" value={String(TRACKS.length)} />
          <StatCard icon={CheckCircle2} label="Concluídos" value={String(done)} accent />
          <StatCard icon={Circle} label="Restantes" value={String(total - done)} />
          <StatCard icon={CheckCircle2} label="Progresso" value={`${percent}%`} />
        </section>

        <div className="space-y-4">
          {TRACKS.map((t) => {
            const tdone = t.challenges.filter((c) => sub[`${t.id}:${c}`]).length;
            return (
              <section key={t.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-card-foreground">{t.label}</h3>
                    <p className="text-xs text-muted-foreground">{t.verse}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{tdone}/{t.challenges.length}</div>
                </div>
                <ul className="mt-3 space-y-2">
                  {t.challenges.map((c) => {
                    const active = !!sub[`${t.id}:${c}`];
                    return (
                      <li key={c}>
                        <button
                          type="button"
                          onClick={() => toggle(t.id, c)}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                            active ? "border-gold bg-gold/10 text-foreground" : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/40"
                          }`}
                        >
                          {active ? <CheckCircle2 className="size-4 text-gold" /> : <Circle className="size-4" />}
                          <span className={active ? "text-foreground" : ""}>{c}</span>
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
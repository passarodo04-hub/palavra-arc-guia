import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Utensils, CalendarDays, Clock, CheckCircle, RotateCcw } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatCard } from "@/components/campaigns/StatCard";
import { CircularProgress } from "@/components/campaigns/CircularProgress";
import { VerseCard } from "@/components/campaigns/VerseCard";
import { daysBetween, formatDatePt, todayISO, useCampaign, verseForDay } from "@/lib/campaigns";

export const Route = createFileRoute("/campanhas/jejum")({
  head: () => ({
    meta: [
      { title: "Jejum — Campanhas — Palavra+" },
      { name: "description", content: "Planeje seu jejum com propósito e acompanhe o progresso." },
    ],
  }),
  component: JejumCampaignPage,
});

const VARIANTS = [
  "Jejum de Daniel",
  "Jejum Parcial",
  "Jejum Completo",
  "Jejum de Redes Sociais",
  "Jejum de Entretenimento",
  "Personalizado",
];

function JejumCampaignPage() {
  const { data, patch, reset, start } = useCampaign("jejum");
  const active = !!data.active;
  const [variant, setVariant] = useState(data.variant ?? "Jejum de Daniel");
  const [startDate, setStartDate] = useState(data.startDate ?? todayISO());
  const [endDate, setEndDate] = useState(data.endDate ?? "");
  const [purpose, setPurpose] = useState(data.purpose ?? "");
  const [notes, setNotes] = useState(data.notes ?? "");

  const total = active && data.startDate && data.endDate ? daysBetween(data.startDate, data.endDate) : 0;
  const elapsed = active && data.startDate ? daysBetween(data.startDate, todayISO()) : 0;
  const percent = total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 0;
  const remaining = Math.max(0, total - elapsed);

  const v = useMemo(() => verseForDay(3), []);

  function begin() {
    if (!endDate) return;
    start({ variant, startDate, endDate, purpose, notes });
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Utensils, label: "Campanha" }}
        title="Jejum"
        description="Consagre um tempo ao Senhor. Escolha o tipo, o período e o propósito do seu jejum."
        backTo="/campanhas"
        backLabel="Campanhas"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        {!active ? (
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up space-y-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gold">Tipo de jejum</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {VARIANTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVariant(v)}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      variant === v ? "border-gold bg-gold/10 text-foreground" : "border-border bg-secondary/40 text-muted-foreground"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="start" className="text-xs uppercase tracking-widest text-muted-foreground">Início</Label>
                <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="end" className="text-xs uppercase tracking-widest text-muted-foreground">Fim</Label>
                <Input id="end" type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="mt-2" />
              </div>
            </div>
            <div>
              <Label htmlFor="purpose" className="text-xs uppercase tracking-widest text-muted-foreground">Propósito</Label>
              <Input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Ex.: buscar direção, quebrantamento, cura..." className="mt-2" />
            </div>
            <div>
              <Label htmlFor="notes" className="text-xs uppercase tracking-widest text-muted-foreground">Anotações</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Registre motivos, versículos, promessas..." className="mt-2 min-h-[100px]" />
            </div>
            <div>
              <Button onClick={begin} disabled={!endDate} className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90 h-11 px-6">
                Começar jejum
              </Button>
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-3xl border border-border bg-card p-6 shadow-elegant animate-fade-up">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <CircularProgress percent={percent} />
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-widest text-gold">{data.variant}</div>
                  <h2 className="mt-1 font-serif text-2xl text-card-foreground">
                    Dia {Math.min(elapsed + 1, total)} de {total}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.purpose ? `"${data.purpose}"` : "Consagre este tempo ao Senhor."}
                  </p>
                  <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gold to-primary" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up">
              <StatCard icon={CalendarDays} label="Início" value={formatDatePt(data.startDate!)} />
              <StatCard icon={CalendarDays} label="Fim" value={formatDatePt(data.endDate!)} />
              <StatCard icon={Clock} label="Restantes" value={`${remaining} d`} accent />
              <StatCard icon={CheckCircle} label="Concluído" value={`${percent}%`} />
            </section>

            {data.notes && (
              <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
                <div className="text-xs font-semibold uppercase tracking-widest text-gold">Anotações</div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{data.notes}</p>
              </section>
            )}

            <VerseCard text={v.text} ref={v.ref} />

            <section className="rounded-3xl border border-border bg-secondary/40 p-6 flex items-center justify-between animate-fade-up">
              <div className="text-xs text-muted-foreground">Encerrar este jejum?</div>
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => confirm("Encerrar jejum?") && reset()}>
                <RotateCcw className="size-4" /> Encerrar
              </Button>
            </section>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
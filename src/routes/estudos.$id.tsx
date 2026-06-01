import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { getSermon, saveSermon, deleteSermon } from "@/lib/cloud.functions";
import type { SermonContent } from "@/lib/sermon.functions";
import { ChevronLeft, Clock, BookOpen, Quote, Sparkles, Star, Trash2, Music, HandHeart, Loader2 } from "lucide-react";

export const Route = createFileRoute("/estudos/$id")({ component: SermonDetail });

function SermonDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchFn = useServerFn(getSermon);
  const saveFn = useServerFn(saveSermon);
  const delFn = useServerFn(deleteSermon);

  const { data: s, isLoading } = useQuery({
    queryKey: ["sermon", id],
    queryFn: () => fetchFn({ data: { id } }),
  });

  const favMutation = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          id: s!.id,
          title: s!.title,
          theme: s!.theme ?? "",
          subject: s!.subject ?? "",
          objective: s!.objective ?? "",
          duration_min: s!.duration_min ?? undefined,
          audience: s!.audience ?? "",
          content: s!.content,
          personal_notes: s!.personal_notes,
          favorite: !s!.favorite,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sermon", id] });
      qc.invalidateQueries({ queryKey: ["sermons"] });
    },
  });

  const delMutation = useMutation({
    mutationFn: () => delFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sermons"] });
      navigate({ to: "/estudos" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!s) {
    return (
      <div className="min-h-screen bg-background p-8 text-center pb-24">
        <p className="font-serif text-muted-foreground">Sermão não encontrado.</p>
        <Link to="/estudos" className="text-primary text-sm mt-4 inline-block">
          ← Voltar aos estudos
        </Link>
        <BottomNav />
      </div>
    );
  }

  const c = (s.content ?? {}) as SermonContent;

  return (
    <div className="min-h-screen bg-background pb-28 animate-fade-up">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-7">
        <Link to="/estudos" className="inline-flex items-center gap-1 text-xs text-primary-foreground/70 hover:text-primary-foreground">
          <ChevronLeft className="size-4" /> Estudos
        </Link>
        <div className="flex items-start justify-between gap-3 mt-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-gold">
              <Sparkles className="size-3.5" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Pregação por IA</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl mt-1">{s.title}</h1>
            <div className="text-[11px] text-primary-foreground/70 mt-1">
              {s.theme} {s.duration_min ? `· ${s.duration_min} min` : ""} {s.audience ? `· ${s.audience}` : ""}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <button onClick={() => favMutation.mutate()} className="p-1.5 rounded-full bg-white/10">
              <Star className="size-4" fill={s.favorite ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => { if (confirm("Excluir esta pregação?")) delMutation.mutate(); }}
              className="p-1.5 rounded-full bg-white/10"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        {(c.introduction?.hook || c.introduction?.context) && (
          <Section title="Introdução">
            {c.introduction.hook && <p className="font-serif text-base leading-relaxed">{c.introduction.hook}</p>}
            {c.introduction.context && <p className="text-sm text-muted-foreground mt-2">{c.introduction.context}</p>}
          </Section>
        )}

        {!!c.development?.points?.length && (
          <Section title="Desenvolvimento" icon={BookOpen}>
            <ol className="space-y-4">
              {c.development.points.map((p, i) => (
                <li key={i} className="border-l-2 border-gold pl-4">
                  <div className="font-serif text-lg">{i + 1}. {p.title}</div>
                  {p.explanation && <p className="text-sm mt-1">{p.explanation}</p>}
                  {p.application && (
                    <p className="text-sm text-muted-foreground mt-1 italic">Aplicação: {p.application}</p>
                  )}
                  {!!p.verses?.length && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.verses.map((v, j) => (
                        <span key={j} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {!!c.verses?.length && (
          <Section title="Versículos" icon={Quote}>
            <ul className="space-y-2">
              {c.verses.map((v, i) => (
                <li key={i} className="rounded-xl bg-secondary/60 p-3">
                  <div className="font-serif text-base">{v.ref}</div>
                  {v.text && <div className="text-sm text-card-foreground mt-1">{v.text}</div>}
                  {v.why && <div className="text-xs text-muted-foreground mt-1">{v.why}</div>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {(c.conclusion?.reflection || c.conclusion?.callToAction) && (
          <Section title="Conclusão">
            {c.conclusion.reflection && <p className="font-serif text-base leading-relaxed">{c.conclusion.reflection}</p>}
            {c.conclusion.callToAction && (
              <p className="text-sm text-gold mt-2 font-medium">{c.conclusion.callToAction}</p>
            )}
          </Section>
        )}

        {(!!c.worship?.harpa?.length || !!c.worship?.songs?.length) && (
          <Section title="Louvor" icon={Music}>
            {!!c.worship.harpa?.length && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Harpa Cristã</div>
                <ul className="mt-2 space-y-1">
                  {c.worship.harpa.map((h, i) => (
                    <li key={i} className="text-sm">
                      {h.number ? <span className="text-gold font-mono mr-2">#{h.number}</span> : null}
                      {h.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!!c.worship.songs?.length && (
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cânticos</div>
                <ul className="mt-2 space-y-1">
                  {c.worship.songs.map((s2, i) => (
                    <li key={i} className="text-sm">• {s2}</li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
        )}

        {!!c.timeline?.length && (
          <Section title="Linha do tempo" icon={Clock}>
            <ol className="space-y-2">
              {c.timeline.map((t, i) => (
                <li key={i} className="flex gap-3 items-baseline">
                  <span className="font-mono text-xs tabular-nums text-gold w-16 shrink-0">
                    {t.from}–{t.to}
                  </span>
                  <span className="text-sm">{t.topic}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {(c.prayers?.opening || c.prayers?.closing || c.prayers?.altarCall) && (
          <Section title="Orações" icon={HandHeart}>
            {c.prayers.opening && <PrayerBlock label="Abertura" text={c.prayers.opening} />}
            {c.prayers.closing && <PrayerBlock label="Encerramento" text={c.prayers.closing} />}
            {c.prayers.altarCall && <PrayerBlock label="Chamada ao altar" text={c.prayers.altarCall} />}
          </Section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function Section({
  title, icon: Icon, children,
}: { title: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
        {Icon && <Icon className="size-3.5" />} {title}
      </div>
      <div className="mt-3 text-card-foreground">{children}</div>
    </section>
  );
}

function PrayerBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-3 first:mt-0">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <p className="mt-1 text-sm font-serif italic">{text}</p>
    </div>
  );
}
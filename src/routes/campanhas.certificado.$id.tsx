import { createFileRoute } from "@tanstack/react-router";
import { Printer, Share2, Award, ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { formatDatePt, todayISO } from "@/lib/campaigns";

export const Route = createFileRoute("/campanhas/certificado/$id")({
  head: () => ({
    meta: [
      { title: "Certificado — Campanhas — Palavra+" },
      { name: "description", content: "Certificado de conclusão de campanha espiritual." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CertificatePage,
});

type Preset = { title: string; verse: string; ref: string };

const PRESETS: Record<string, Preset> = {
  "leia-biblia": {
    title: "Leitura de Toda a Bíblia",
    verse: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.",
    ref: "Salmos 119:105",
  },
  "harpa-desafio": {
    title: "Desafio da Harpa Cristã",
    verse: "Cantai ao Senhor um cântico novo, e o seu louvor na congregação.",
    ref: "Salmos 149:1",
  },
  "devocional-365": {
    title: "Ano Devocional — 365 dias",
    verse: "Bem-aventurado o homem cujo prazer está na lei do Senhor.",
    ref: "Salmos 1:1-2",
  },
};

function CertificatePage() {
  const { id } = Route.useParams();
  const preset = PRESETS[id] ?? {
    title: "Campanha concluída",
    verse: "Combati o bom combate, acabei a carreira, guardei a fé.",
    ref: "2 Timóteo 4:7",
  };
  const { user } = useAuth();
  const name =
    (user?.user_metadata as { full_name?: string; name?: string } | undefined)?.full_name ??
    (user?.user_metadata as { name?: string } | undefined)?.name ??
    user?.email?.split("@")[0] ??
    "Servo(a) de Cristo";

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Concluí a campanha "${preset.title}" no Palavra+.`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: preset.title, text, url }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 print:bg-white print:pb-0">
      <div className="mx-auto max-w-3xl px-4 pt-8 print:hidden">
        <Link to="/campanhas" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-3.5" /> Voltar às campanhas
        </Link>
      </div>
      <main className="mx-auto max-w-3xl px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl border-2 border-gold/40 bg-card p-8 md:p-12 text-center shadow-elegant print:border-2 print:border-black print:shadow-none">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "radial-gradient(circle at 50% 0%, hsl(var(--primary)), transparent 60%)" }}
          />
          <div className="relative">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gold/10 text-gold">
              <Award className="size-8" />
            </div>
            <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Certificado de conclusão</div>
            <h1 className="mt-3 font-serif text-3xl md:text-4xl text-foreground">{preset.title}</h1>
            <p className="mt-6 text-sm text-muted-foreground">Este certificado é conferido a</p>
            <p className="mt-2 font-serif text-2xl md:text-3xl text-foreground">{name}</p>
            <p className="mt-6 max-w-lg mx-auto font-serif text-base text-foreground">"{preset.verse}"</p>
            <p className="mt-1 text-xs text-muted-foreground">— {preset.ref}</p>
            <div className="mt-8 inline-block rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground">
              Concluído em {formatDatePt(todayISO())}
            </div>
            <p className="mt-6 text-xs italic text-muted-foreground">
              "Bem está, servo bom e fiel. Permaneça firme na sua caminhada com Cristo."
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2 print:hidden">
          <Button onClick={() => window.print()} className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90 h-11 px-5">
            <Printer className="size-4" /> Imprimir / Salvar PDF
          </Button>
          <Button variant="outline" onClick={share} className="rounded-full h-11 px-5">
            <Share2 className="size-4" /> Compartilhar
          </Button>
        </div>
      </main>
    </div>
  );
}
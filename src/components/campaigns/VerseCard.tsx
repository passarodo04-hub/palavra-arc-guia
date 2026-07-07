import { Sparkles } from "lucide-react";

export function VerseCard({ text, ref }: { text: string; ref: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-gold">
        <Sparkles className="size-3.5" />
        Palavra para hoje
      </div>
      <blockquote className="mt-2 font-serif text-base text-foreground">"{text}"</blockquote>
      <div className="mt-1 text-xs text-muted-foreground">— {ref}</div>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { COLOR_LABELS, HIGHLIGHT_COLORS, type HighlightColor } from "@/lib/bible-highlights";
import { Highlighter, X } from "lucide-react";

export function HighlightPicker({ color, onChange, disabled = false, onClose }: {
  color?: HighlightColor; onChange: (color: HighlightColor | null) => void; disabled?: boolean; onClose?: () => void;
}) {
  return <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-2 text-foreground shadow-soft" role="group" aria-label="Cores do marca-texto">
    <Highlighter className="size-4 text-muted-foreground" aria-hidden="true" />
    {HIGHLIGHT_COLORS.map((c) => <Button key={c} type="button" variant="ghost" size="icon"
      disabled={disabled} onClick={() => onChange(c)} title={COLOR_LABELS[c]}
      aria-label={`Marcar ${COLOR_LABELS[c].toLowerCase()}`} aria-pressed={color === c}
      className={`size-10 border ${color === c ? "border-foreground" : "border-transparent"}`}>
      <span className={`size-6 rounded-sm highlight-swatch-${c}`} aria-hidden="true" />
    </Button>)}
    {color && <Button type="button" variant="ghost" size="icon" disabled={disabled} onClick={() => onChange(null)} title="Remover marcação" aria-label="Remover marcação" className="size-10"><X /></Button>}
    {onClose && <Button type="button" variant="ghost" size="sm" onClick={onClose}>Fechar</Button>}
  </div>;
}
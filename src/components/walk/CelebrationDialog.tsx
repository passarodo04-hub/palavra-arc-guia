import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Unlockable } from "@/lib/walk";

export function CelebrationDialog({
  items,
  onClose,
}: {
  items: Unlockable[] | null;
  onClose: () => void;
}) {
  const open = !!items && items.length > 0;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl text-center">
        <DialogHeader>
          <DialogTitle className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
            ✨ Nova conquista
          </DialogTitle>
          <DialogDescription className="sr-only">
            Você desbloqueou novos itens na sua caminhada.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3">
          {(items ?? []).map((i) => (
            <li
              key={`${i.kind}:${i.id}`}
              className="animate-fade-up rounded-2xl border border-gold/40 bg-gold/10 p-4 motion-reduce:animate-none"
            >
              <div aria-hidden className="text-3xl">
                {i.emoji}
              </div>
              <div className="mt-1 font-serif text-lg text-foreground">{i.name}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {i.kind === "item"
                  ? "Você desbloqueou um novo item para sua Mochila Espiritual."
                  : i.description}
              </p>
            </li>
          ))}
        </ul>
        <Button
          className="h-11 w-full rounded-full bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
          onClick={onClose}
        >
          Continuar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
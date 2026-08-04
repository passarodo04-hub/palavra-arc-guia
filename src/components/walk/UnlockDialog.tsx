import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ResolvedUnlockable } from "@/lib/walk";
import { formatDayPt } from "@/lib/walk";

export function UnlockDialog({
  item,
  onOpenChange,
}: {
  item: ResolvedUnlockable | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        {item && (
          <>
            <DialogHeader>
              <div
                aria-hidden
                className={`mx-auto flex size-16 items-center justify-center rounded-2xl border text-3xl ${
                  item.unlocked ? "border-gold/50 bg-gold/10" : "border-border bg-secondary grayscale opacity-60"
                }`}
              >
                {item.emoji}
              </div>
              <DialogTitle className="mt-3 text-center font-serif text-xl">{item.name}</DialogTitle>
              <DialogDescription className="text-center">{item.description}</DialogDescription>
            </DialogHeader>
            <dl className="mt-2 space-y-3 text-sm">
              <div className="rounded-2xl border border-border bg-secondary/40 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Como desbloquear
                </dt>
                <dd className="mt-1 text-foreground">{item.requirement}</dd>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/40 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Situação
                </dt>
                <dd className="mt-1 text-foreground">
                  {item.unlocked
                    ? item.unlockedAt
                      ? `✅ Desbloqueado em ${formatDayPt(item.unlockedAt.slice(0, 10))}`
                      : "✅ Desbloqueado"
                    : "🔒 Ainda não conquistado"}
                </dd>
              </div>
            </dl>
            <Button
              className="mt-2 h-11 w-full rounded-full bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
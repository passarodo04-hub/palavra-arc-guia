import { Link } from "@tanstack/react-router";
import { ChevronLeft, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type PageHeroProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: { icon?: LucideIcon; label: string };
  backTo?: string;
  backLabel?: string;
  right?: ReactNode;
  children?: ReactNode;
};

/**
 * Standardized page hero used across every top-level section.
 * - Consistent height, padding, radius, spacing and typography.
 * - Content below should use `mx-auto max-w-3xl px-4 pt-6` (no negative margins).
 */
export function PageHero({
  title,
  description,
  eyebrow,
  backTo,
  backLabel,
  right,
  children,
}: PageHeroProps) {
  const EyebrowIcon = eyebrow?.icon;
  return (
    <header className="relative overflow-hidden bg-gradient-spiritual text-primary-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 10%, white, transparent 50%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 pt-10 pb-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {backTo && (
              <Link
                to={backTo}
                className="inline-flex items-center gap-1 text-xs text-primary-foreground/80 hover:text-primary-foreground"
              >
                <ChevronLeft className="size-3.5" />
                {backLabel ?? "Voltar"}
              </Link>
            )}
            {eyebrow && (
              <div
                className={`flex items-center gap-2 text-gold ${backTo ? "mt-4" : ""}`}
              >
                {EyebrowIcon && <EyebrowIcon className="size-4" />}
                <span className="text-xs font-medium uppercase tracking-[0.2em]">
                  {eyebrow.label}
                </span>
              </div>
            )}
            <h1
              className={`font-serif text-3xl md:text-4xl leading-tight ${
                eyebrow || backTo ? "mt-3" : ""
              }`}
            >
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm text-primary-foreground/80 max-w-md">
                {description}
              </p>
            )}
            {children && <div className="mt-5">{children}</div>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      </div>
    </header>
  );
}
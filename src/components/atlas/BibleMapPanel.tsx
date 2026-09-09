import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const BibleGeoMap = lazy(() => import("./BibleGeoMap"));

function Placeholder() {
  return (
    <div className="flex h-[min(70vh,460px)] w-full items-center justify-center bg-secondary text-sm text-muted-foreground">
      Carregando mapa…
    </div>
  );
}

export function BibleMapPanel(props: { readSet: Set<string>; onOpen: (id: string) => void }) {
  return (
    <ClientOnly fallback={<Placeholder />}>
      <Suspense fallback={<Placeholder />}>
        <BibleGeoMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}

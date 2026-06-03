import { useEffect, useRef } from "react";

// Reusable Google AdSense slot. Renders nothing unless a publisher ID is
// configured via VITE_ADSENSE_CLIENT and the page is not the editor preview.
// Placement guidance: never inside Bible chapter readers or devotional content;
// use only on index/listing pages.

const CLIENT = (import.meta as any).env?.VITE_ADSENSE_CLIENT as string | undefined;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let scriptInjected = false;
function ensureScript(client: string) {
  if (scriptInjected || typeof document === "undefined") return;
  if (document.querySelector('script[data-adsense="1"]')) {
    scriptInjected = true;
    return;
  }
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.dataset.adsense = "1";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  document.head.appendChild(s);
  scriptInjected = true;
}

function isPreviewHost() {
  if (typeof window === "undefined") return true;
  const h = window.location.hostname;
  return h.includes("id-preview--") || h.includes("lovableproject.com") || h === "localhost";
}

export function AdSlot({ slot, format = "auto", className = "" }: { slot: string; format?: "auto" | "fluid" | "rectangle"; className?: string }) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!CLIENT || isPreviewHost()) return;
    ensureScript(CLIENT);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense push failed", e);
    }
  }, [slot]);

  if (!CLIENT || isPreviewHost()) {
    return null;
  }

  return (
    <div className={`my-6 flex justify-center ${className}`} aria-label="Publicidade">
      <ins
        ref={ref as any}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight: 90 }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
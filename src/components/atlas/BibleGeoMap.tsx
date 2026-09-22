import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { BIBLE_PLACES, isPlaceDiscovered } from "@/lib/bible-places";

/**
 * Mapa geográfico real (tiles OpenStreetMap, uso livre com atribuição).
 * Reutiliza integralmente BIBLE_PLACES — nada de dados fictícios.
 * Carregado apenas no cliente (Leaflet depende de window).
 */

function icon(discovered: boolean) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 1px 4px rgba(0,0,0,.45);background:${
      discovered ? "#d4a437" : "rgba(120,120,120,.75)"
    }"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -8],
  });
}

function FitBounds({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length) map.fitBounds(L.latLngBounds(bounds), { padding: [32, 32] });
  }, [map, bounds]);
  return null;
}

function PortugueseBaseMap() {
  const map = useMap();

  useEffect(() => {
    const layer = maplibreGL({ style: "/map-styles/biblical-pt.json" }).addTo(map);
    const attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · <a href="https://openfreemap.org/">OpenFreeMap</a>';
    map.attributionControl.addAttribution(attribution);

    return () => {
      map.removeLayer(layer);
      map.attributionControl.removeAttribution(attribution);
    };
  }, [map]);

  return null;
}

export default function BibleGeoMap({
  readSet,
  onOpen,
}: {
  readSet: Set<string>;
  onOpen: (id: string) => void;
}) {
  const bounds = useMemo(
    () => BIBLE_PLACES.map((p) => [p.coords.lat, p.coords.lng] as [number, number]),
    [],
  );

  return (
    <MapContainer
      center={[31.7, 35.2]}
      zoom={7}
      scrollWheelZoom
      style={{ height: "min(70vh, 460px)", width: "100%" }}
      className="z-0"
    >
      <PortugueseBaseMap />
      <FitBounds bounds={bounds} />
      {BIBLE_PLACES.map((p) => {
        const open = isPlaceDiscovered(p, readSet);
        return (
          <Marker key={p.id} position={[p.coords.lat, p.coords.lng]} icon={icon(open)} title={p.name}>
            <Popup>
              <strong>{p.emoji} {p.name}</strong>
              <br />
              <span style={{ fontSize: 12 }}>{p.region}{p.modern ? ` · ${p.modern}` : ""}</span>
              <br />
              <button
                type="button"
                onClick={() => onOpen(p.id)}
                style={{ marginTop: 6, fontWeight: 600, textDecoration: "underline" }}
              >
                Ver detalhes
              </button>
              <br />
              <span style={{ fontSize: 11, opacity: 0.7 }}>
                {open ? "Descoberto na sua leitura" : "Ainda não descoberto"}
              </span>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

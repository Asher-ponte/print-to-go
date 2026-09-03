"use client";

import { CABUYAO } from "@/lib/constants";
import type { GeoPin } from "@/lib/types";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type Marker = {
  id: string;
  lat: number;
  lng: number;
  label: string;
};

type Props = {
  pin?: Pick<GeoPin, "lat" | "lng"> | null;
  onPin?: (lat: number, lng: number) => void;
  markers?: Marker[];
  className?: string;
};

export function LocationMap({ pin, onPin, markers, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const onPinRef = useRef(onPin);
  const markersRef = useRef(markers);
  const pinRef = useRef(pin);
  const markerKey = JSON.stringify(
    (markers ?? []).map((marker) => [marker.id, marker.lat, marker.lng, marker.label]),
  );

  useEffect(() => {
    onPinRef.current = onPin;
    markersRef.current = markers;
    pinRef.current = pin;
  }, [onPin, markers, pin]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !el) return;

      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const currentPin = pinRef.current;
      const currentMarkers = markersRef.current;
      const center: [number, number] = [currentPin?.lat ?? CABUYAO.lat, currentPin?.lng ?? CABUYAO.lng];
      map = L.map(el, { scrollWheelZoom: true }).setView(center, 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const layer = L.layerGroup().addTo(map);

      const render = () => {
        layer.clearLayers();
        if (currentMarkers?.length) {
          const bounds: [number, number][] = [];
          for (const marker of currentMarkers) {
            L.marker([marker.lat, marker.lng]).bindPopup(marker.label).addTo(layer);
            bounds.push([marker.lat, marker.lng]);
          }
          if (bounds.length > 1) map?.fitBounds(bounds, { padding: [28, 28] });
        } else if (currentPin) {
          L.marker([currentPin.lat, currentPin.lng]).addTo(layer);
        }
      };

      render();

      if (onPinRef.current) {
        map.on("click", (event) => onPinRef.current?.(event.latlng.lat, event.latlng.lng));
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [pin?.lat, pin?.lng, markerKey]);

  return <div ref={ref} className={className ?? "h-72 w-full overflow-hidden rounded-xl border"} />;
}

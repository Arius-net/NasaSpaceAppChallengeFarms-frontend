"use client";

import { useState } from "react";

export interface MapboxViewerProps {
  parcelId?: string;
  parcelName?: string;
  coordinates?: { lat: number; lng: number };
}

// Renderiza el visor geoespacial interactivo centrado en La Frailesca con selector de capas NASA.
export default function MapboxViewer({
  parcelId = "FRA-01",
  parcelName = "El Sabinal (Villaflores)",
  coordinates = { lat: 16.2334, lng: -93.2682 },
}: MapboxViewerProps) {
  const [activeLayer, setActiveLayer] = useState<"SMAP" | "IMERG" | "POWER">("SMAP");
  const [zoom, setZoom] = useState(13);

  return (
    <div className="relative flex-1 min-h-[380px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 flex flex-col justify-between">
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.28), transparent 65%), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
          backgroundSize: "100% 100%, 36px 36px, 36px 36px",
        }}
      />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 backdrop-blur">
          <p className="text-xs font-bold text-white">
            Visor Mapbox GL · {parcelName} ({parcelId})
          </p>
          <p className="font-mono text-[11px] text-slate-400">
            Lat: {coordinates.lat.toFixed(4)}° N · Lng: {coordinates.lng.toFixed(4)}° W · Zoom: {zoom}x
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-1 backdrop-blur">
          {(["SMAP", "IMERG", "POWER"] as const).map((layer) => (
            <button
              key={layer}
              type="button"
              onClick={() => setActiveLayer(layer)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                activeLayer === layer
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              NASA {layer}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 my-auto flex flex-col items-center justify-center py-8">
        <div className="relative flex h-44 w-64 items-center justify-center rounded-2xl border-2 border-emerald-500/70 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <div className="text-center">
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] text-emerald-300">
              Polígono {parcelId}
            </span>
            <p className="mt-2 text-xs font-semibold text-white">
              Capa activa: NASA {activeLayer}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-300">
              {activeLayer === "SMAP" && "Humedad radicular: 0.28 m³/m³"}
              {activeLayer === "IMERG" && "Precipitación 10d: 42.6 mm"}
              {activeLayer === "POWER" && "Radiación / Temp: 29.4 °C"}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-[11px]">
          NEXT_PUBLIC_MAPBOX_TOKEN · Región La Frailesca, Chiapas
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(8, z - 1))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-white hover:bg-slate-800"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(18, z + 1))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-white hover:bg-slate-800"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

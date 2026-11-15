"use client";

import { useState } from "react";
import type { ClimateTelemetry } from "@/services/api";

export interface MapboxViewerProps {
  parcelId?: string;
  parcelName?: string;
  coordinates?: { lat: number; lng: number };
  telemetry?: ClimateTelemetry;
}

export default function MapboxViewer({
  parcelId = "FRA-01",
  parcelName = "El Sabinal",
  coordinates = { lat: 16.2334, lng: -93.2682 },
  telemetry,
}: MapboxViewerProps) {
  const [activeLayer, setActiveLayer] = useState<"SMAP" | "IMERG" | "POWER">("SMAP");
  const [zoom, setZoom] = useState(13);
  const layerText = {
    SMAP: `Humedad radicular: ${telemetry?.smapSoilMoisture === undefined ? "Sin datos" : `${telemetry.smapSoilMoisture} m³/m³`}`,
    IMERG: `Lluvia acumulada: ${telemetry?.imergPrecipMm === undefined ? "Sin datos" : `${telemetry.imergPrecipMm} mm`}`,
    POWER: `Temperatura: ${telemetry?.powerTempC === undefined ? "Sin datos" : `${telemetry.powerTempC} °C`}`,
  };

  return (
    <section className="min-h-[390px] rounded-xl border border-[#dce4dc] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-wider text-[#647269]">Mapa de parcela</p><h2 className="mt-1 text-xl font-extrabold">{parcelName} <span className="font-normal text-[#647269]">/{parcelId}</span></h2></div>
        <div className="flex rounded-lg border border-[#dce4dc] bg-[#f7f8f3] p-1">
          {(["SMAP", "IMERG", "POWER"] as const).map((layer) => <button key={layer} type="button" onClick={() => setActiveLayer(layer)} className={`rounded-md px-3 py-1.5 text-xs font-bold ${activeLayer === layer ? "bg-[#176b4d] text-white" : "text-[#647269] hover:text-[#176b4d]"}`}>{layer}</button>)}
        </div>
      </div>
      <div className="relative my-5 flex h-52 items-center justify-center overflow-hidden rounded-lg bg-[#dcead4]">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(#b8d2b7 1px, transparent 1px), linear-gradient(90deg, #b8d2b7 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="relative h-32 w-64 rotate-[-3deg] border-2 border-[#176b4d] bg-[#b9db91] p-3 text-center shadow-[10px_10px_0_#9cc878]"><p className="mt-10 text-sm font-bold text-[#0e4935]">{parcelId}</p><p className="text-xs text-[#176b4d]">{layerText[activeLayer]}</p></div>
        <span className="absolute left-4 top-4 rounded-md bg-white px-2 py-1 text-[11px] font-bold text-[#176b4d]">Capa: {activeLayer}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#647269]">
        <span>Lat {coordinates.lat.toFixed(4)} · Lng {coordinates.lng.toFixed(4)} · Zoom {zoom}x</span>
        <div className="flex gap-2"><button type="button" aria-label="Alejar mapa" onClick={() => setZoom((value) => Math.max(8, value - 1))} className="h-7 w-7 rounded-md border border-[#b8c8bc] font-bold hover:bg-[#e8f1df]">−</button><button type="button" aria-label="Acercar mapa" onClick={() => setZoom((value) => Math.min(18, value + 1))} className="h-7 w-7 rounded-md border border-[#b8c8bc] font-bold hover:bg-[#e8f1df]">+</button></div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

const PARCEL_HISTORY = [
  { id: "FRA-01", nombre: "El Sabinal (Villaflores)", ciclo: "PV 2025", ha: "4.5 ha", estado: "Óptimo" },
  { id: "FRA-02", nombre: "San Pedro (Villa Corzo)", ciclo: "PV 2025", ha: "6.0 ha", estado: "Vigilancia" },
  { id: "FRA-03", nombre: "La Concordia Norte", ciclo: "PV 2024", ha: "3.2 ha", estado: "Histórico" },
];

const CLIMATE_CARDS = [
  { fuente: "NASA POWER", metrica: "Temp. Superficial", valor: "29.4 °C", detalle: "Anomalía +1.2 °C (7d)" },
  { fuente: "NASA SMAP", metrica: "Humedad de Suelo", valor: "0.28 m³/m³", detalle: "Zona radicular (0-100cm)" },
  { fuente: "NASA IMERG", metrica: "Precipitación Acum.", valor: "42.6 mm", detalle: "Últimos 10 días" },
];

// Renderiza el layout principal del dashboard con sidebar de historial y contenedor central.
export default function DashboardPage() {
  const [selectedParcel, setSelectedParcel] = useState(PARCEL_HISTORY[0]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="font-bold tracking-tight text-white">K&apos;INAL</span>
          <span className="text-xs text-slate-400">
            Sistema de Apoyo a la Decisión Agrícola · La Frailesca, Chiapas
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-300">
            Parcela activa: {selectedParcel.id}
          </span>
          <Link href="/" className="text-slate-400 hover:text-white">
            Salir
          </Link>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        <aside className="lg:col-span-3 border-r border-slate-800 bg-slate-900/50 p-5 space-y-6">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Historial de Parcelas
            </h2>
            <div className="mt-3 space-y-2.5">
              {PARCEL_HISTORY.map((parcela) => (
                <button
                  key={parcela.id}
                  onClick={() => setSelectedParcel(parcela)}
                  className={`w-full text-left rounded-xl border p-3 transition ${
                    selectedParcel.id === parcela.id
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{parcela.nombre}</span>
                    <span className="text-[11px] text-emerald-400">{parcela.estado}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {parcela.id} · Ciclo {parcela.ciclo} · {parcela.ha}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Telemetría Satelital Cruda
            </h2>
            <div className="mt-3 space-y-2.5">
              {CLIMATE_CARDS.map((card) => (
                <div
                  key={card.fuente}
                  className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{card.metrica}</span>
                    <span className="font-mono text-[11px] text-emerald-400">{card.fuente}</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-white">{card.valor}</p>
                  <p className="text-xs text-slate-500">{card.detalle}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-9 p-6 flex flex-col gap-6">
          <div className="flex-1 min-h-[420px] rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-white">
                  Visor Agroclimático — {selectedParcel.nombre}
                </h1>
                <p className="text-xs text-slate-400">
                  Coordenadas base: 16.233° N, -93.268° W · Maíz de Temporal
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                Capas NASA listas
              </span>
            </div>

            <div className="my-auto text-center py-16 border border-dashed border-slate-800 rounded-xl">
              <p className="text-sm font-medium text-slate-300">
                Contenedor central preparado para el visor geoespacial Mapbox / Deck.gl
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Polígono activo: {selectedParcel.id} ({selectedParcel.ha})
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

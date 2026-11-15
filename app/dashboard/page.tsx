"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AIRecommendationPanel from "@/components/AIRecommendationPanel";
import MapboxViewer from "@/components/MapboxViewer";
import {
  ApiError,
  ClimateTelemetry,
  AgronomicRecommendationResponse,
  ForecastResponse,
  fetchForecast,
  fetchRecommendation,
  fetchWeather,
} from "@/services/api";

const PARCEL_HISTORY = [
  { id: "FRA-01", nombre: "El Sabinal", ubicacion: "Villaflores", ciclo: "PV 2025", ha: "4.5 ha", estado: "Óptimo", coords: { lat: 16.2334, lon: -93.2682 } },
  { id: "FRA-02", nombre: "San Pedro", ubicacion: "Villa Corzo", ciclo: "PV 2025", ha: "6.0 ha", estado: "Vigilancia", coords: { lat: 16.1852, lon: -93.2689 } },
  { id: "FRA-03", nombre: "La Concordia Norte", ubicacion: "La Concordia", ciclo: "PV 2024", ha: "3.2 ha", estado: "Histórico", coords: { lat: 16.1165, lon: -92.6885 } },
];

const CLIMATE_CARDS = [
  ["Temperatura", "powerTempC", "NASA POWER"],
  ["Humedad", "smapSoilMoisture", "NASA SMAP"],
  ["Lluvia", "imergPrecipMm", "NASA IMERG"],
] as const;

type DashboardData = {
  weather?: ClimateTelemetry;
  recommendation?: AgronomicRecommendationResponse;
  forecast?: ForecastResponse;
};

function formatMetric(value: number | undefined, suffix: string): string {
  return value === undefined ? "Sin datos" : `${value} ${suffix}`;
}

export default function DashboardPage() {
  const [selectedParcel, setSelectedParcel] = useState(PARCEL_HISTORY[0]);
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadData = useCallback(async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    setLoading(true);
    setError(undefined);
    const results = await Promise.allSettled([
      fetchWeather(selectedParcel.coords, signal),
      fetchRecommendation(selectedParcel.coords, signal),
      fetchForecast(selectedParcel.coords, signal),
    ]);

    if (signal?.aborted) return;

    const [weather, recommendation, forecast] = results;
    setData({
      weather: weather.status === "fulfilled" ? weather.value : undefined,
      recommendation: recommendation.status === "fulfilled" ? recommendation.value : undefined,
      forecast: forecast.status === "fulfilled" ? forecast.value : undefined,
    });

    const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
    if (failures.length > 0) {
      const firstError = failures[0].reason;
      setError(firstError instanceof ApiError ? firstError.message : "No fue posible consultar el backend.");
    }
    setLoading(false);
  }, [selectedParcel]);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => void loadData(controller.signal));
    return () => controller.abort();
  }, [loadData]);

  const weather = data.weather;
  const recommendation = data.recommendation;

  return <div className="min-h-screen bg-[#f7f8f3] text-[#17231c]">
    <header className="border-b border-[#dce4dc] bg-white"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4"><Link href="/" className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#176b4d] text-sm font-bold text-white">K</span><span className="font-extrabold">K&apos;INAL</span></Link><div className="flex items-center gap-4 text-sm"><span className="hidden text-[#647269] md:inline">Panel agrícola</span><Link href="/" className="font-bold text-[#176b4d]">Salir</Link></div></div></header>
    <main className="mx-auto max-w-[1440px] px-6 py-8">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#176b4d]">Monitoreo en vivo</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Resumen de parcelas</h1></div><button type="button" onClick={() => void loadData()} disabled={loading} className="rounded-lg bg-[#176b4d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0e4935] disabled:cursor-wait disabled:opacity-60">{loading ? "Cargando..." : "Actualizar datos"}</button></div>
      {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e5b7ad] bg-[#fce1dc] px-4 py-3 text-sm text-[#8f3429]"><span>{error}</span><button type="button" onClick={() => void loadData()} className="font-bold underline">Reintentar</button></div>}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-[#dce4dc] bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-sm font-extrabold">Mis parcelas</h2><span className="rounded-full bg-[#e8f1df] px-2 py-1 text-xs font-bold text-[#176b4d]">{PARCEL_HISTORY.length}</span></div><div className="mt-4 space-y-2">{PARCEL_HISTORY.map((parcel) => <button key={parcel.id} onClick={() => setSelectedParcel(parcel)} className={`w-full rounded-lg border p-3 text-left ${selectedParcel.id === parcel.id ? "border-[#176b4d] bg-[#e8f1df]" : "border-[#dce4dc] hover:border-[#9fbaa6]"}`}><div className="flex items-start justify-between gap-2"><span className="text-sm font-bold">{parcel.nombre}</span><span className="text-[11px] font-bold text-[#176b4d]">{parcel.estado}</span></div><p className="mt-1 text-xs text-[#647269]">{parcel.id} · {parcel.ubicacion}</p><p className="mt-2 text-[11px] text-[#647269]">{parcel.ciclo} · {parcel.ha}</p></button>)}</div></aside>
        <section className="space-y-6"><div className="grid gap-4 sm:grid-cols-3">{CLIMATE_CARDS.map(([label, key, source]) => <div key={label} className="rounded-xl border border-[#dce4dc] bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-[#647269]">{label}</p><p className="mt-2 text-2xl font-extrabold">{loading ? "Cargando..." : key === "powerTempC" ? formatMetric(weather?.powerTempC, "°C") : key === "smapSoilMoisture" ? formatMetric(weather?.smapSoilMoisture, "m³/m³") : formatMetric(weather?.imergPrecipMm, "mm")}</p><p className="mt-1 text-xs font-bold text-[#176b4d]">{source}</p></div>)}</div><MapboxViewer parcelId={selectedParcel.id} parcelName={selectedParcel.nombre} coordinates={{ lat: selectedParcel.coords.lat, lng: selectedParcel.coords.lon }} telemetry={weather} /><AIRecommendationPanel parcelId={selectedParcel.id} parcelName={selectedParcel.nombre} droughtAlertLevel={recommendation?.droughtAlertLevel} confidence={recommendation?.confidence} sowingWindow={recommendation?.sowingWindow} llmSummary={recommendation?.llmSummary} degradation={recommendation?.degradation || data.forecast?.degradation} loading={loading} /></section>
      </div>
    </main>
  </div>;
}

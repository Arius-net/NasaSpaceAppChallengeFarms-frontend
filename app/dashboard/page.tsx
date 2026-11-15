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
  DEFAULT_DEMO_FARM_ID,
  fetchForecast,
  fetchRecommendation,
} from "@/services/api";

const PARCEL_HISTORY = [
  { id: "FRA-01", farmId: "00000000-0000-4000-8000-000000000001", nombre: "El Sabinal", ubicacion: "Villaflores", ciclo: "PV 2025", ha: "4.5 ha", estado: "Óptimo", coords: { lat: 16.2334, lon: -93.2682 } },
  { id: "FRA-02", farmId: "00000000-0000-4000-8000-000000000002", nombre: "San Pedro", ubicacion: "Villa Corzo", ciclo: "PV 2025", ha: "6.0 ha", estado: "Vigilancia", coords: { lat: 16.1852, lon: -93.2689 } },
  { id: "FRA-03", farmId: "00000000-0000-4000-8000-000000000003", nombre: "La Concordia Norte", ubicacion: "La Concordia", ciclo: "PV 2024", ha: "3.2 ha", estado: "Histórico", coords: { lat: 16.1165, lon: -92.6885 } },
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
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({
    lat: PARCEL_HISTORY[0].coords.lat,
    lon: PARCEL_HISTORY[0].coords.lon,
  });
  const [customPoint, setCustomPoint] = useState(false);
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadData = useCallback(
    async (targetLat: number, targetLon: number, farmId: string = DEFAULT_DEMO_FARM_ID, signal?: AbortSignal) => {
      if (signal?.aborted) return;
      setLoading(true);
      setError(undefined);

      try {
        const [recommendation, forecast] = await Promise.all([
          fetchRecommendation(targetLat, targetLon, farmId, signal),
          fetchForecast(targetLat, targetLon, signal),
        ]);

        if (signal?.aborted) return;

        setData({
          weather: recommendation.telemetry,
          recommendation,
          forecast,
        });
      } catch (err) {
        if (signal?.aborted) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "No fue posible consultar el backend."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    const farmId = selectedParcel.farmId || DEFAULT_DEMO_FARM_ID;
    queueMicrotask(() => void loadData(coords.lat, coords.lon, farmId, controller.signal));
    return () => controller.abort();
  }, [coords.lat, coords.lon, selectedParcel.farmId, loadData]);

  const handleSelectParcel = (parcel: (typeof PARCEL_HISTORY)[number]) => {
    setSelectedParcel(parcel);
    setCustomPoint(false);
    setCoords({ lat: parcel.coords.lat, lon: parcel.coords.lon });
  };

  const handleSelectCoordinateOnMap = (lat: number, lon: number) => {
    setCustomPoint(true);
    setCoords({ lat, lon });
  };

  const weather = data.weather;
  const recommendation = data.recommendation;
  const forecast = data.forecast;
  const viabilityMetrics = forecast?.viabilityMetrics || recommendation?.viabilityMetrics;

  const gwetCurrent = forecast?.gwetrootCurrent ?? weather?.smapSoilMoisture;
  const gwetP50 = forecast?.gwetrootP50;
  const gwetPct =
    gwetP50 !== undefined
      ? Math.min(100, Math.max(0, Math.round(gwetP50 * 100)))
      : gwetCurrent !== undefined
      ? Math.min(100, Math.max(0, Math.round(gwetCurrent * 100)))
      : undefined;

  const currentPct =
    gwetCurrent !== undefined
      ? Math.min(100, Math.max(0, Math.round(gwetCurrent * 100)))
      : undefined;

  const soilStatusLabel =
    gwetPct === undefined
      ? "Sin datos"
      : gwetPct >= 37
      ? "Humedad Óptima"
      : gwetPct >= 35
      ? "Reserva en Vigilancia"
      : "Riesgo de Estrés Hídrico";

  const gddActual = viabilityMetrics?.gddAnualBase10C;
  const gddRequired = 1530;
  const gddPct =
    gddActual !== undefined
      ? Math.min(100, Math.max(5, Math.round((gddActual / gddRequired) * 100)))
      : undefined;

  const displayParcelName = customPoint
    ? recommendation?.locationLabel || "Punto seleccionado"
    : selectedParcel.nombre;
  const displayParcelId = customPoint
    ? `${coords.lat.toFixed(3)}, ${coords.lon.toFixed(3)}`
    : selectedParcel.id;

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-[#17231c]">
      <header className="border-b border-[#dce4dc] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#176b4d] text-sm font-bold text-white">
              K
            </span>
            <span className="font-extrabold">K&apos;INAL</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-[#647269] md:inline">Modo Demo Interactiva</span>
            <Link href="/" className="font-bold text-[#176b4d]">
              Inicio
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#176b4d]">
              Monitoreo en vivo
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
              Resumen de parcelas
            </h1>
          </div>
          <button
            type="button"
            onClick={() =>
              void loadData(coords.lat, coords.lon, selectedParcel.farmId || DEFAULT_DEMO_FARM_ID)
            }
            disabled={loading}
            className="rounded-lg bg-[#176b4d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0e4935] disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Cargando..." : "Actualizar datos"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e5b7ad] bg-[#fce1dc] px-4 py-3 text-sm text-[#8f3429]"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() =>
                void loadData(coords.lat, coords.lon, selectedParcel.farmId || DEFAULT_DEMO_FARM_ID)
              }
              className="font-bold underline"
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-xl border border-[#dce4dc] bg-white p-4 shadow-sm h-fit">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold">Mis parcelas</h2>
              <span className="rounded-full bg-[#e8f1df] px-2 py-1 text-xs font-bold text-[#176b4d]">
                {PARCEL_HISTORY.length}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {PARCEL_HISTORY.map((parcel) => {
                const isActive = !customPoint && selectedParcel.id === parcel.id;
                return (
                  <button
                    key={parcel.id}
                    onClick={() => handleSelectParcel(parcel)}
                    className={`w-full rounded-lg border p-3 text-left ${
                      isActive
                        ? "border-[#176b4d] bg-[#e8f1df]"
                        : "border-[#dce4dc] hover:border-[#9fbaa6]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold">{parcel.nombre}</span>
                      <span className="text-[11px] font-bold text-[#176b4d]">{parcel.estado}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#647269]">
                      {parcel.id} · {parcel.ubicacion}
                    </p>
                    <p className="mt-2 text-[11px] text-[#647269]">
                      {parcel.ciclo} · {parcel.ha}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {CLIMATE_CARDS.map(([label, key, source]) => (
                <div key={label} className="rounded-xl border border-[#dce4dc] bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#647269]">{label}</p>
                  <p className="mt-2 font-mono text-2xl font-extrabold">
                    {loading
                      ? "Cargando..."
                      : key === "powerTempC"
                      ? formatMetric(weather?.powerTempC, "°C")
                      : key === "smapSoilMoisture"
                      ? formatMetric(weather?.smapSoilMoisture, "m³/m³")
                      : formatMetric(weather?.imergPrecipMm, "mm")}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#176b4d]">{source}</p>
                </div>
              ))}
            </div>

            <MapboxViewer
              parcelId={displayParcelId}
              parcelName={displayParcelName}
              coordinates={{ lat: coords.lat, lng: coords.lon }}
              telemetry={weather}
              semaforoColor={recommendation?.semaforoColor}
              onSelectCoordinate={handleSelectCoordinateOnMap}
            />

            <AIRecommendationPanel
              parcelId={displayParcelId}
              parcelName={displayParcelName}
              droughtAlertLevel={recommendation?.droughtAlertLevel}
              confidence={recommendation?.confidence}
              uncertainty={recommendation?.uncertainty}
              sowingWindow={recommendation?.sowingWindow}
              llmSummary={recommendation?.llmSummary}
              degradation={recommendation?.degradation || data.forecast?.degradation}
              loading={loading}
            />
          </section>
        </div>

        <section className="mt-10 border-t-2 border-[#dce4dc] pt-8">
          <div className="rounded-2xl border border-[#dce4dc] bg-[#eef3ec] p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#176b4d]">
                  Indicadores de Respaldo
                </span>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#17231c]">
                  Análisis Técnico y Proyecciones
                </h2>
                <p className="mt-1 text-sm text-[#647269]">
                  Comportamiento esperado del suelo, lluvias recientes y calor acumulado para el desarrollo del maíz.
                </p>
              </div>
              <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#176b4d] shadow-xs">
                Actualizado para {displayParcelName}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-[#dce4dc] bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#647269]">
                      Reserva de Humedad (7 días)
                    </span>
                    <span className="rounded-md bg-[#e8f1df] px-2.5 py-1 font-mono text-[10px] font-bold text-[#176b4d]">
                      [XGBoost ML Forecast]
                    </span>
                  </div>

                  <p className="mt-4 text-2xl font-extrabold text-[#17231c]">
                    {loading ? "Calculando..." : soilStatusLabel}
                  </p>
                  <p className="mt-1 text-xs text-[#647269]">
                    {loading
                      ? "Evaluando retención en zona de raíz..."
                      : gwetPct !== undefined && currentPct !== undefined
                      ? `Proyección al ${gwetPct}% de saturación (hoy: ${currentPct}%)`
                      : "Nivel estimado de agua disponible para la semilla"}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#647269]">Saturación estimada</span>
                      <span className="font-mono text-[#176b4d]">
                        {loading ? "..." : gwetPct !== undefined ? `${gwetPct}%` : "N/D"}
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-[#eef2ed]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          gwetPct !== undefined && gwetPct >= 37
                            ? "bg-emerald-600"
                            : gwetPct !== undefined && gwetPct >= 35
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${gwetPct ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="mt-5 border-t border-[#eef2ed] pt-3 font-mono text-[11px] text-[#647269]">
                  Ref. técnica: p50 {gwetP50 !== undefined ? gwetP50.toFixed(3) : "N/D"} · Banda p10–p90 (
                  {forecast?.gwetrootP10 !== undefined && forecast?.gwetrootP90 !== undefined
                    ? `${forecast.gwetrootP10.toFixed(2)}–${forecast.gwetrootP90.toFixed(2)}`
                    : "N/D"}
                  )
                </p>
              </div>

              <div className="rounded-2xl border border-[#dce4dc] bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#647269]">
                      Lluvia Acumulada Reciente
                    </span>
                    <span className="rounded-md bg-[#e8f1df] px-2.5 py-1 text-[10px] font-bold text-[#176b4d]">
                      Últimas 2 semanas
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-mono text-4xl font-extrabold tracking-tight text-[#176b4d]">
                      {loading
                        ? "..."
                        : weather?.precip7dMm !== undefined
                        ? `${weather.precip7dMm}`
                        : "0"}
                    </span>
                    <span className="text-sm font-bold text-[#647269]">
                      mm en los últimos 7 días
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#f7f8f3] p-3">
                      <span className="block text-[11px] font-semibold text-[#647269]">
                        Últimos 3 días
                      </span>
                      <span className="mt-0.5 block font-mono text-lg font-extrabold text-[#17231c]">
                        {loading
                          ? "..."
                          : weather?.precip3dMm !== undefined
                          ? `${weather.precip3dMm} mm`
                          : "N/D"}
                      </span>
                    </div>
                    <div className="rounded-xl bg-[#f7f8f3] p-3">
                      <span className="block text-[11px] font-semibold text-[#647269]">
                        Últimos 14 días
                      </span>
                      <span className="mt-0.5 block font-mono text-lg font-extrabold text-[#17231c]">
                        {loading
                          ? "..."
                          : weather?.precip14dMm !== undefined
                          ? `${weather.precip14dMm} mm`
                          : "N/D"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-5 border-t border-[#eef2ed] pt-3 text-xs font-medium text-[#647269]">
                  Frecuencia:{" "}
                  <strong className="text-[#17231c]">
                    {loading
                      ? "..."
                      : weather?.rainyDays !== undefined
                      ? `${weather.rainyDays} días con lluvia efectiva`
                      : "Sin registro reciente"}
                  </strong>{" "}
                  en la quincena.
                </p>
              </div>

              <div className="rounded-2xl border border-[#dce4dc] bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#647269]">
                      Potencial Térmico del Ciclo
                    </span>
                    <span className="rounded-md bg-[#e8f1df] px-2.5 py-1 font-mono text-[10px] font-bold text-[#176b4d]">
                      GDD Base 10 °C
                    </span>
                  </div>

                  <p className="mt-4 text-2xl font-extrabold text-[#17231c]">
                    {loading
                      ? "Calculando..."
                      : gddActual !== undefined && gddActual >= gddRequired
                      ? "Calor Suficiente para Maíz"
                      : "Calor Limitado en la Zona"}
                  </p>
                  <p className="mt-1 text-xs text-[#647269]">
                    El maíz requiere al menos <strong>{gddRequired} °C·d</strong> para completar su maduración.
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#647269]">Meta del ciclo ({gddRequired} °C·d)</span>
                      <span className="font-mono text-[#176b4d]">
                        {loading
                          ? "..."
                          : gddActual !== undefined
                          ? `${Math.round(gddActual)} °C·d`
                          : "N/D"}
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-[#eef2ed]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          gddActual !== undefined && gddActual >= gddRequired
                            ? "bg-green-500"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${gddPct ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="mt-5 border-t border-[#eef2ed] pt-3 font-mono text-[11px] text-[#647269]">
                  Cumplimiento térmico:{" "}
                  <strong className="text-[#17231c]">
                    {loading ? "..." : gddPct !== undefined ? `${gddPct}% del umbral mínimo` : "N/D"}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

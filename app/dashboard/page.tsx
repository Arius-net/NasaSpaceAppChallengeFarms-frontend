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
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({
    lat: PARCEL_HISTORY[0].coords.lat,
    lon: PARCEL_HISTORY[0].coords.lon,
  });
  const [customPoint, setCustomPoint] = useState(false);
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadData = useCallback(
    async (targetLat: number, targetLon: number, farmId?: string, signal?: AbortSignal) => {
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
    const farmId = customPoint ? undefined : selectedParcel.id;
    queueMicrotask(() => void loadData(coords.lat, coords.lon, farmId, controller.signal));
    return () => controller.abort();
  }, [coords.lat, coords.lon, customPoint, selectedParcel.id, loadData]);

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
  const gwetDelta =
    gwetP50 !== undefined && gwetCurrent !== undefined
      ? Number((gwetP50 - gwetCurrent).toFixed(3))
      : undefined;

  const gddActual = viabilityMetrics?.gddAnualBase10C;
  const gddRequired = 1530;
  const gddPct =
    gddActual !== undefined
      ? Math.min(100, Math.round((gddActual / gddRequired) * 100))
      : undefined;

  const displayParcelName = customPoint
    ? recommendation?.locationLabel || "Punto seleccionado en La Frailesca"
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
            <span className="hidden text-[#647269] md:inline">Panel agrícola</span>
            <Link href="/" className="font-bold text-[#176b4d]">
              Salir
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
              void loadData(coords.lat, coords.lon, customPoint ? undefined : selectedParcel.id)
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
                void loadData(coords.lat, coords.lon, customPoint ? undefined : selectedParcel.id)
              }
              className="font-bold underline"
            >
              Reintentar
            </button>
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-xl border border-[#dce4dc] bg-white p-4 shadow-sm">
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

            <div className="rounded-xl border border-[#dce4dc] bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#dce4dc] pb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#176b4d]">
                    Pulso Agroclimático y Pronóstico
                  </p>
                  <h2 className="mt-0.5 text-base font-extrabold text-[#17231c]">
                    Indicadores Predictivos y Balance Térmico-Pluvial
                  </h2>
                </div>
                <span className="rounded-md border border-[#cbd9ce] bg-[#f7f8f3] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#176b4d]">
                  Horizonte t+7 días · Escala nativa 0–1
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-[#dce4dc] bg-[#f7f8f3] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#647269]">
                        Humedad a 7 días (GWETROOT)
                      </span>
                      <span className="rounded bg-[#176b4d] px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                        [XGBoost ML Forecast]
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-3">
                      <div>
                        <span className="block text-[10px] font-semibold uppercase text-[#647269]">
                          Pronóstico p50
                        </span>
                        <span className="font-mono text-2xl font-extrabold text-[#176b4d]">
                          {loading
                            ? "..."
                            : gwetP50 !== undefined
                            ? gwetP50.toFixed(3)
                            : "Sin datos"}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#647269]">vs</span>
                      <div>
                        <span className="block text-[10px] font-semibold uppercase text-[#647269]">
                          Actual
                        </span>
                        <span className="font-mono text-lg font-bold text-[#17231c]">
                          {loading
                            ? "..."
                            : gwetCurrent !== undefined
                            ? gwetCurrent.toFixed(3)
                            : "Sin datos"}
                        </span>
                      </div>
                      {!loading && gwetDelta !== undefined && (
                        <span
                          className={`ml-auto rounded px-2 py-0.5 font-mono text-xs font-bold ${
                            gwetDelta >= 0
                              ? "bg-[#d7edb4] text-[#176b4d]"
                              : "bg-[#fff0cf] text-[#8a5a08]"
                          }`}
                        >
                          {gwetDelta >= 0 ? `+${gwetDelta}` : gwetDelta}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 border-t border-[#dce4dc] pt-2.5 flex items-center justify-between font-mono text-[11px] text-[#647269]">
                    <span>
                      Banda p10–p90:{" "}
                      {forecast?.gwetrootP10 !== undefined && forecast?.gwetrootP90 !== undefined
                        ? `${forecast.gwetrootP10.toFixed(2)} – ${forecast.gwetrootP90.toFixed(2)}`
                        : "N/D"}
                    </span>
                    <span className="font-bold text-[#176b4d]">
                      {forecast?.forecastClass || "Estable"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#dce4dc] bg-[#f7f8f3] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#647269]">
                        Lluvia Acumulada Multi-Ventana
                      </span>
                      <span className="rounded border border-[#cbd9ce] bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-[#176b4d]">
                        [PRECTOTCORR]
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border border-[#dce4dc] bg-white p-2">
                        <span className="block text-[10px] font-bold uppercase text-[#647269]">
                          3 Días
                        </span>
                        <span className="mt-0.5 block font-mono text-base font-extrabold text-[#17231c]">
                          {loading
                            ? "..."
                            : weather?.precip3dMm !== undefined
                            ? `${weather.precip3dMm} mm`
                            : "N/D"}
                        </span>
                      </div>
                      <div className="rounded-lg border border-[#176b4d]/40 bg-white p-2">
                        <span className="block text-[10px] font-bold uppercase text-[#176b4d]">
                          7 Días
                        </span>
                        <span className="mt-0.5 block font-mono text-base font-extrabold text-[#176b4d]">
                          {loading
                            ? "..."
                            : weather?.precip7dMm !== undefined
                            ? `${weather.precip7dMm} mm`
                            : "N/D"}
                        </span>
                      </div>
                      <div className="rounded-lg border border-[#dce4dc] bg-white p-2">
                        <span className="block text-[10px] font-bold uppercase text-[#647269]">
                          14 Días
                        </span>
                        <span className="mt-0.5 block font-mono text-base font-extrabold text-[#17231c]">
                          {loading
                            ? "..."
                            : weather?.precip14dMm !== undefined
                            ? `${weather.precip14dMm} mm`
                            : "N/D"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-[#dce4dc] pt-2.5 flex items-center justify-between font-mono text-[11px] text-[#647269]">
                    <span>Días con lluvia (&ge;1 mm):</span>
                    <span className="font-bold text-[#17231c]">
                      {loading
                        ? "..."
                        : weather?.rainyDays !== undefined
                        ? `${weather.rainyDays} de 14 días`
                        : "Sin datos"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#dce4dc] bg-[#f7f8f3] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#647269]">
                        Potencial Térmico (GDD)
                      </span>
                      <span className="rounded border border-[#cbd9ce] bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-[#8a5a08]">
                        [Base 10 °C]
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <div>
                        <span className="block text-[10px] font-semibold uppercase text-[#647269]">
                          GDD Anual Estimado
                        </span>
                        <span className="font-mono text-2xl font-extrabold text-[#17231c]">
                          {loading
                            ? "..."
                            : gddActual !== undefined
                            ? `${Math.round(gddActual)} °C·d`
                            : "Sin datos"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-semibold uppercase text-[#647269]">
                          Requerido Ciclo
                        </span>
                        <span className="font-mono text-sm font-bold text-[#176b4d]">
                          {gddRequired} °C·d
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#dce4dc]">
                      <div
                        className={`h-full transition-all ${
                          gddActual !== undefined && gddActual >= gddRequired
                            ? "bg-[#176b4d]"
                            : "bg-[#d97706]"
                        }`}
                        style={{ width: `${gddPct ?? 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 border-t border-[#dce4dc] pt-2.5 flex items-center justify-between font-mono text-[11px] text-[#647269]">
                    <span>Viabilidad térmica:</span>
                    <span
                      className={`font-bold ${
                        gddActual !== undefined && gddActual >= gddRequired
                          ? "text-[#176b4d]"
                          : "text-[#8a5a08]"
                      }`}
                    >
                      {loading
                        ? "..."
                        : gddActual !== undefined
                        ? gddActual >= gddRequired
                          ? "Cumple requerimiento"
                          : "Por debajo del óptimo"
                        : viabilityMetrics?.verdict || "Sin datos"}
                    </span>
                  </div>
                </div>
              </div>
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
      </main>
    </div>
  );
}

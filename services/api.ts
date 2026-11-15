export interface Coordinates {
  lat: number;
  lon: number;
}

export interface ClimateTelemetry {
  powerTempC?: number;
  smapSoilMoisture?: number;
  imergPrecipMm?: number;
  updatedAt?: string;
}

export interface AgronomicRecommendationResponse {
  recommendationId?: string;
  sowingWindow?: string;
  droughtAlertLevel?: "Baja" | "Moderada" | "Alta";
  confidence?: number;
  llmSummary?: string;
  viability?: string;
  assumptions?: string[];
  dataVintage?: string;
  uncertainty?: string;
  degradation?: string;
}

export interface ForecastResponse {
  values: unknown[];
  degradation?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(data: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function readString(data: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function readRecord(data: Record<string, unknown>, keys: string[]): Record<string, unknown> | undefined {
  for (const key of keys) {
    const value = data[key];
    if (isRecord(value)) return value;
  }
  return undefined;
}

function buildUrl(path: string, coordinates: Coordinates): string {
  const search = new URLSearchParams({
    lat: String(coordinates.lat),
    lon: String(coordinates.lon),
  });
  return `${API_BASE_URL}/api/${path}?${search.toString()}`;
}

function validateCoordinates(coordinates: Coordinates): void {
  if (
    !Number.isFinite(coordinates.lat) ||
    !Number.isFinite(coordinates.lon) ||
    coordinates.lat < -90 ||
    coordinates.lat > 90 ||
    coordinates.lon < -180 ||
    coordinates.lon > 180
  ) {
    throw new ApiError("Las coordenadas de la parcela no son válidas.");
  }
}

async function getJson(path: string, coordinates: Coordinates, signal?: AbortSignal): Promise<Record<string, unknown>> {
  validateCoordinates(coordinates);
  const response = await fetch(buildUrl(path, coordinates), { signal, cache: "no-store" });
  if (!response.ok) {
    throw new ApiError(`El backend respondió con HTTP ${response.status}.`, response.status);
  }
  const payload: unknown = await response.json();
  if (!isRecord(payload)) {
    throw new ApiError(`La respuesta de /api/${path} no tiene un formato válido.`);
  }
  return payload;
}

export async function fetchWeather(coordinates: Coordinates, signal?: AbortSignal): Promise<ClimateTelemetry> {
  const data = await getJson("weather", coordinates, signal);
  const summary = readRecord(data, ["resumen_meteorologico", "summary"]);
  const soil = summary ? readRecord(summary, ["humedad_suelo_estimada", "soil_moisture"]) : undefined;
  return {
    powerTempC: readNumber(summary || data, ["powerTempC", "temperature", "temperatura_media_c", "temperature_c", "temp_c"]),
    smapSoilMoisture: readNumber(soil || data, ["smapSoilMoisture", "soil_moisture", "smSoilMoisture", "sm_radicular_v_v"]),
    imergPrecipMm: readNumber(summary || data, ["imergPrecipMm", "precipitation", "precipitacion_acumulada_7d_mm", "precipitation_mm", "precip_mm"]),
    updatedAt: readString(data, ["updatedAt", "updated_at", "timestamp", "timestamp_consulta"]),
  };
}

export async function fetchRecommendation(
  coordinates: Coordinates,
  signal?: AbortSignal
): Promise<AgronomicRecommendationResponse> {
  const data = await getJson("recommendation", coordinates, signal);
  const recommendation = readRecord(data, ["recomendacion_agronomica", "recommendation"]);
  const source = recommendation || data;
  const alertText = readString(source, ["alerta_riesgo_climatico", "droughtAlertLevel", "drought_alert_level", "alerta_sequia"])?.toUpperCase();
  const alert = alertText?.includes("ESTRES") || alertText?.includes("SEQUÍA") ? "Alta" : alertText?.includes("PRECAUCIÓN") || alertText?.includes("VIGILANCIA") ? "Moderada" : alertText?.includes("ÓPTIMO") ? "Baja" : undefined;
  return {
    recommendationId: readString(data, ["recommendationId", "recommendation_id"]),
    sowingWindow: readString(source, ["sowingWindow", "sowing_window", "ventana_siembra", "decision_siembra"]),
    droughtAlertLevel: alert === "Baja" || alert === "Moderada" || alert === "Alta" ? alert : undefined,
    confidence: readNumber(source, ["confidence", "confianza"]),
    llmSummary: readString(source, ["llmSummary", "llm_summary", "mensaje_productor", "summary", "resumen"]),
    viability: readString(data, ["viabilidad", "viability"]),
    assumptions: Array.isArray(source.supuestos) ? source.supuestos.filter((item): item is string => typeof item === "string") : undefined,
    dataVintage: readString(source, ["data_vintage", "dataVintage"]),
    uncertainty: readString(source, ["incertidumbre", "uncertainty"]),
    degradation: readString(source, ["degradacion", "degradation"]),
  };
}

export async function fetchForecast(coordinates: Coordinates, signal?: AbortSignal): Promise<ForecastResponse> {
  const data = await getJson("forecast", coordinates, signal);
  const values = Array.isArray(data.forecast) ? data.forecast : Array.isArray(data.values) ? data.values : [];
  const degradation = readRecord(data, ["degradacion", "degradation"]);
  return {
    values,
    degradation: readString(data, ["degradacion", "degradation"]) || (degradation ? readString(degradation, ["leyenda", "legend", "nota"]) : undefined),
  };
}

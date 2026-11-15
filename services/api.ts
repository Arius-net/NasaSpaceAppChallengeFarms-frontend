export interface Coordinates {
  lat: number;
  lon: number;
}

export interface ClimateTelemetry {
  powerTempC?: number;
  smapSoilMoisture?: number;
  imergPrecipMm?: number;
  precip3dMm?: number;
  precip7dMm?: number;
  precip14dMm?: number;
  rainyDays?: number;
  updatedAt?: string;
}

export interface ViabilityMetrics {
  verdict?: string;
  gddAnualBase10C?: number;
  gddRequiredC?: number;
  precipAnualMm?: number;
  precipCicloMm?: number;
}

export interface AgronomicRecommendationResponse {
  recommendationId?: string;
  sowingWindow?: string;
  droughtAlertLevel?: "Baja" | "Moderada" | "Alta";
  confidence?: number;
  confidenceLabel?: string;
  semaforoColor?: string;
  locationLabel?: string;
  llmSummary?: string;
  viability?: string;
  viabilityMetrics?: ViabilityMetrics;
  assumptions?: string[];
  dataVintage?: string;
  uncertainty?: string;
  degradation?: string;
  telemetry?: ClimateTelemetry;
}

export interface ForecastResponse {
  status?: string;
  horizonDays?: number;
  gwetrootCurrent?: number;
  gwettopCurrent?: number;
  currentClass?: string;
  gwetrootP10?: number;
  gwetrootP50?: number;
  gwetrootP90?: number;
  forecastClass?: string;
  riskNote?: string;
  modelType?: string;
  degradation?: string;
  degradationLevel?: string;
  viabilityMetrics?: ViabilityMetrics;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const DEFAULT_DEMO_FARM_ID = "00000000-0000-4000-8000-000000000001";

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

function extractViabilityMetrics(payload: Record<string, unknown>): ViabilityMetrics | undefined {
  const viab = readRecord(payload, ["viabilidad", "viability"]);
  if (!viab) return undefined;
  const evidencia = readRecord(viab, ["evidencia", "evidence"]);
  const umbrales = readRecord(viab, ["umbrales_usados", "thresholds"]);
  return {
    verdict: readString(viab, ["veredicto", "verdict"]),
    gddAnualBase10C: evidencia ? readNumber(evidencia, ["gdd_anual_base10_c"]) : undefined,
    gddRequiredC: (umbrales ? readNumber(umbrales, ["gdd_min_maiz_c"]) : undefined) ?? 1530,
    precipAnualMm: evidencia ? readNumber(evidencia, ["precip_anual_mm"]) : undefined,
    precipCicloMm: evidencia ? readNumber(evidencia, ["precip_ciclo_abr_oct_mm"]) : undefined,
  };
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
  const summary = readRecord(data, ["resumen_meteorologico", "resumen", "summary"]);
  const soil = summary ? readRecord(summary, ["humedad_suelo_estimada", "soil_moisture"]) : undefined;
  const src = summary || data;
  return {
    powerTempC: readNumber(src, ["powerTempC", "temperature", "temperatura_media_c", "temperature_c", "temp_c"]),
    smapSoilMoisture: readNumber(soil || src, ["smapSoilMoisture", "soil_moisture", "smSoilMoisture", "sm_radicular_v_v"]),
    imergPrecipMm: readNumber(src, ["imergPrecipMm", "precipitation", "precipitacion_acumulada_7d_mm", "precipitation_mm", "precip_mm"]),
    precip3dMm: readNumber(src, ["precipitacion_acumulada_3d_mm", "precip3dMm"]),
    precip7dMm: readNumber(src, ["precipitacion_acumulada_7d_mm", "precip7dMm"]),
    precip14dMm: readNumber(src, ["precipitacion_acumulada_14d_mm", "precip14dMm"]),
    rainyDays: readNumber(src, ["dias_con_lluvia_significativa", "rainyDays"]),
    updatedAt: readString(data, ["updatedAt", "updated_at", "timestamp", "timestamp_consulta"]),
  };
}

export async function fetchRecommendation(
  lat: number,
  lon: number,
  farm_id: string = DEFAULT_DEMO_FARM_ID,
  signal?: AbortSignal
): Promise<AgronomicRecommendationResponse> {
  validateCoordinates({ lat, lon });
  const bodyPayload: Record<string, unknown> = {
    lat,
    lon,
    farm_id: farm_id || DEFAULT_DEMO_FARM_ID,
  };

  let response = await fetch(`${API_BASE_URL}/api/recommendation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(bodyPayload),
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    const query = new URLSearchParams({ lat: String(lat), lon: String(lon) });
    const fallbackResponse = await fetch(`${API_BASE_URL}/api/recommendation?${query.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
      cache: "no-store",
    });
    if (fallbackResponse.ok) {
      response = fallbackResponse;
    }
  }

  if (!response.ok) {
    throw new ApiError(`El backend respondió con HTTP ${response.status}.`, response.status);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload)) {
    throw new ApiError("La respuesta de /api/recommendation no tiene un formato válido.");
  }

  const recommendation = readRecord(payload, ["recomendacion_agronomica", "recommendation", "data"]);
  const source = recommendation || payload;
  const coordsRecord = readRecord(payload, ["coordenadas"]);
  const weatherRecord = readRecord(payload, ["datos_meteorologicos"]);
  const weatherSummary = weatherRecord ? readRecord(weatherRecord, ["resumen", "resumen_meteorologico"]) : undefined;
  const soilRecord = weatherSummary ? readRecord(weatherSummary, ["humedad_suelo_estimada"]) : undefined;

  const alertText = readString(source, [
    "alerta_riesgo_climatico",
    "droughtAlertLevel",
    "drought_alert_level",
    "alerta_sequia",
    "risk_level",
  ])?.toUpperCase();

  const semaforo = readString(source, ["semaforo_color"]);
  const alert =
    semaforo === "alert" || alertText?.includes("ALTA") || alertText?.includes("ESTRES") || alertText?.includes("SEQUÍA") || alertText?.includes("SEQUIA")
      ? "Alta"
      : semaforo === "warn" || alertText?.includes("MODERADA") || alertText?.includes("PRECAUCIÓN") || alertText?.includes("VIGILANCIA")
      ? "Moderada"
      : semaforo === "signal" || alertText?.includes("BAJA") || alertText?.includes("ÓPTIMO") || alertText?.includes("OPTIMO")
      ? "Baja"
      : undefined;

  const uncertaintyObj = isRecord(source.incertidumbre) ? source.incertidumbre : undefined;
  const uncertaintyStr =
    readString(source, ["incertidumbre", "uncertainty", "uncertainty_level", "margen_incertidumbre"]) ||
    (uncertaintyObj ? readString(uncertaintyObj, ["banda", "nivel", "descripcion"]) : undefined) ||
    readString(source, ["nivel_confianza"]);

  const confidenceNum = readNumber(source, ["confidence", "confianza", "confidence_score"]);
  const confidenceLabel = readString(source, ["nivel_confianza"]);

  return {
    recommendationId: readString(payload, ["recommendationId", "recommendation_id", "id"]),
    sowingWindow: readString(source, [
      "sowingWindow",
      "sowing_window",
      "ventana_siembra",
      "decision_siembra",
      "planting_window",
    ]),
    droughtAlertLevel: alert === "Baja" || alert === "Moderada" || alert === "Alta" ? alert : undefined,
    confidence: confidenceNum,
    confidenceLabel,
    semaforoColor: semaforo,
    locationLabel: coordsRecord ? readString(coordsRecord, ["nombre_ubicacion", "municipio"]) : undefined,
    llmSummary: readString(source, [
      "llmSummary",
      "llm_summary",
      "mensaje_productor",
      "diagnostico_climatico",
      "recommendation_text",
      "recommendation",
      "summary",
      "resumen",
      "respuesta",
    ]),
    viability: readString(payload, ["viabilidad", "viability"]),
    viabilityMetrics: extractViabilityMetrics(payload),
    assumptions: Array.isArray(source.supuestos)
      ? source.supuestos.filter((item): item is string => typeof item === "string")
      : undefined,
    dataVintage: readString(source, ["data_vintage", "dataVintage"]),
    uncertainty: uncertaintyStr,
    degradation: readString(source, ["degradacion", "degradation"]),
    telemetry: weatherSummary
      ? {
          powerTempC: readNumber(weatherSummary, ["temperatura_media_c", "powerTempC"]),
          smapSoilMoisture: readNumber(soilRecord || weatherSummary, ["sm_radicular_v_v", "smapSoilMoisture"]),
          imergPrecipMm: readNumber(weatherSummary, ["precipitacion_acumulada_7d_mm", "imergPrecipMm"]),
          precip3dMm: readNumber(weatherSummary, ["precipitacion_acumulada_3d_mm", "precip3dMm"]),
          precip7dMm: readNumber(weatherSummary, ["precipitacion_acumulada_7d_mm", "precip7dMm"]),
          precip14dMm: readNumber(weatherSummary, ["precipitacion_acumulada_14d_mm", "precip14dMm"]),
          rainyDays: readNumber(weatherSummary, ["dias_con_lluvia_significativa", "rainyDays"]),
        }
      : undefined,
  };
}

export async function fetchForecast(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<ForecastResponse> {
  validateCoordinates({ lat, lon });
  const response = await fetch(`${API_BASE_URL}/api/forecast?lat=${lat}&lon=${lon}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
    cache: "no-store",
  });
  if (!response.ok) {
    throw new ApiError(`El backend respondió con HTTP ${response.status}.`, response.status);
  }
  const data: unknown = await response.json();
  if (!isRecord(data)) {
    throw new ApiError("La respuesta de /api/forecast no tiene un formato válido.");
  }

  const estadoActual = readRecord(data, ["estado_actual"]);
  const pronostico = readRecord(data, ["pronostico"]);
  const riesgo = pronostico ? readRecord(pronostico, ["riesgo_anticipado"]) : undefined;
  const degradacion = readRecord(data, ["degradacion", "degradation"]);
  const modelo = readRecord(data, ["modelo"]);

  return {
    status: readString(data, ["status"]),
    horizonDays: readNumber(data, ["horizonte_dias"]) ?? 7,
    gwetrootCurrent: estadoActual ? readNumber(estadoActual, ["gwetroot"]) : undefined,
    gwettopCurrent: estadoActual ? readNumber(estadoActual, ["gwettop"]) : undefined,
    currentClass: estadoActual ? readString(estadoActual, ["clasificacion"]) : undefined,
    gwetrootP10: pronostico ? readNumber(pronostico, ["gwetroot_p10"]) : undefined,
    gwetrootP50: pronostico ? readNumber(pronostico, ["gwetroot_p50"]) : undefined,
    gwetrootP90: pronostico ? readNumber(pronostico, ["gwetroot_p90"]) : undefined,
    forecastClass: pronostico ? readString(pronostico, ["clasificacion_escenario_central"]) : undefined,
    riskNote: riesgo ? readString(riesgo, ["nota"]) : undefined,
    modelType: modelo ? readString(modelo, ["tipo"]) : undefined,
    degradationLevel: degradacion ? readString(degradacion, ["nivel"]) : undefined,
    degradation:
      readString(data, ["degradacion", "degradation"]) ||
      (degradacion ? readString(degradacion, ["leyenda", "legend", "nota"]) : undefined),
    viabilityMetrics: extractViabilityMetrics(data),
  };
}

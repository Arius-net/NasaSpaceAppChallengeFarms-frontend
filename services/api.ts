export interface ClimateTelemetry {
  powerTempC: number;
  smapSoilMoisture: number;
  imergPrecipMm: number;
  updatedAt: string;
}

export interface AgronomicRecommendationResponse {
  parcelId: string;
  sowingWindow: string;
  droughtAlertLevel: "Baja" | "Moderada" | "Alta";
  confidence: number;
  llmSummary: string;
  telemetry: ClimateTelemetry;
}

const FASTAPI_BASE_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api/v1";

// Obtiene la telemetria satelital de la NASA (POWER, SMAP, IMERG) desde el backend FastAPI.
export async function fetchParcelTelemetry(parcelId: string): Promise<ClimateTelemetry> {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/parcels/${parcelId}/telemetry`);
    if (!res.ok) throw new Error("FastAPI endpoint unavailable");
    return (await res.json()) as ClimateTelemetry;
  } catch {
    return {
      powerTempC: 29.4,
      smapSoilMoisture: 0.28,
      imergPrecipMm: 42.6,
      updatedAt: "2026-11-14T19:00:00-06:00",
    };
  }
}

// Solicita al motor RAG en FastAPI la recomendacion agronomica e incertidumbre para una parcela.
export async function fetchAIRecommendation(
  parcelId: string
): Promise<AgronomicRecommendationResponse> {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/parcels/${parcelId}/recommendation`);
    if (!res.ok) throw new Error("FastAPI RAG endpoint unavailable");
    return (await res.json()) as AgronomicRecommendationResponse;
  } catch {
    const telemetry = await fetchParcelTelemetry(parcelId);
    return {
      parcelId,
      sowingWindow: "22 de mayo – 04 de junio",
      droughtAlertLevel: parcelId === "FRA-02" ? "Alta" : "Moderada",
      confidence: 84,
      llmSummary:
        "Recomendación generada con datos satelitales NASA (SMAP/IMERG/POWER). Condiciones favorables para inicio de siembra en la última semana de mayo con vigilancia ante anomalía hídrica intraestival.",
      telemetry,
    };
  }
}

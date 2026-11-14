"use client";

export interface AIRecommendationProps {
  parcelId: string;
  parcelName: string;
  sowingWindow?: string;
  droughtAlertLevel?: "Baja" | "Moderada" | "Alta";
  confidence?: number;
  llmSummary?: string;
}

// Renderiza el panel de Recomendacion Agronomica de IA con ventana de siembra e incertidumbre.
export default function AIRecommendationPanel({
  parcelId,
  parcelName,
  sowingWindow = "22 de mayo – 04 de junio",
  droughtAlertLevel = "Moderada",
  confidence = 84,
  llmSummary = "Con base en la humedad radicular de NASA SMAP (0.28 m³/m³) y el acumulado pluvial de IMERG (42.6 mm), se recomienda iniciar la siembra de maíz de temporal a partir del 22 de mayo. Se prevé una disminución moderada de lluvias hacia mediados de julio (canícula), por lo que se sugiere variedad de ciclo intermedio y monitoreo semanal de retención de humedad.",
}: AIRecommendationProps) {
  const alertBadgeStyle =
    droughtAlertLevel === "Alta"
      ? "border-red-500/40 bg-red-500/10 text-red-400"
      : droughtAlertLevel === "Moderada"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Módulo RAG · Recomendación Agronómica de IA
          </span>
          <h2 className="mt-0.5 text-base font-bold text-white">
            Diagnóstico para {parcelName} ({parcelId})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${alertBadgeStyle}`}>
            Alerta de Sequía: {droughtAlertLevel}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
            Confianza IA: {confidence}% (±{100 - confidence}% incertidumbre)
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-400">Ventana Óptima de Siembra</p>
          <p className="mt-1 text-base font-bold text-emerald-400">{sowingWindow}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Calculada con umbrales históricos de precipitación IMERG (&gt;35 mm)
          </p>
        </div>

        <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Síntesis del Modelo Generativo (LLM + Datos NASA)
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{llmSummary}</p>
        </div>
      </div>
    </div>
  );
}

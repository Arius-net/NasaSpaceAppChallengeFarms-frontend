"use client";

export interface AIRecommendationProps {
  parcelId: string;
  parcelName: string;
  sowingWindow?: string;
  droughtAlertLevel?: "Baja" | "Moderada" | "Alta";
  confidence?: number;
  uncertainty?: string;
  llmSummary?: string;
  degradation?: string;
  loading?: boolean;
}

export default function AIRecommendationPanel({
  parcelId,
  parcelName,
  sowingWindow,
  droughtAlertLevel,
  confidence,
  uncertainty,
  llmSummary,
  degradation,
  loading = false,
}: AIRecommendationProps) {
  const alertStyle = !droughtAlertLevel
    ? "bg-[#eef2ed] text-[#647269]"
    : droughtAlertLevel === "Alta"
    ? "bg-[#fce1dc] text-[#a33b2f]"
    : droughtAlertLevel === "Moderada"
    ? "bg-[#fff0cf] text-[#8a5a08]"
    : "bg-[#d7edb4] text-[#176b4d]";

  const uncertaintyBadge = loading
    ? "Calculando incertidumbre..."
    : uncertainty
    ? `Incertidumbre: ${uncertainty}`
    : confidence !== undefined
    ? `Confianza ${confidence}% (±${Math.max(0, 100 - confidence)}% incert.)`
    : "Incertidumbre: Sin datos";

  return (
    <section className="rounded-xl border border-[#cbd9ce] bg-[#e8f1df] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#cbd9ce] pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#176b4d]">
            Recomendación Agronómica
          </p>
          <h2 className="mt-1 text-xl font-extrabold">
            {parcelName} <span className="font-normal text-[#647269]">/{parcelId}</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className={`rounded-full px-3 py-1.5 ${alertStyle}`}>
            Sequía: {loading ? "Cargando..." : droughtAlertLevel || "Sin datos"}
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-[#176b4d]">
            {uncertaintyBadge}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-lg bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#647269]">
            Ventana de siembra
          </p>
          <p className="mt-2 text-2xl font-extrabold text-[#176b4d]">
            {loading ? "Cargando..." : sowingWindow || "Sin datos"}
          </p>
          <p className="mt-2 text-xs text-[#647269]">
            Estimación calculada con telemetría climática de la parcela.
          </p>
        </div>

        <div className="rounded-lg bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#647269]">
            Diagnóstico agronómico
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#17231c]">
            {loading
              ? "Consultando recomendación..."
              : llmSummary || "El backend no devolvió una síntesis."}
          </p>
        </div>
      </div>

      {degradation && (
        <p className="mt-3 rounded-lg bg-[#fff0cf] px-3 py-2 text-xs font-bold text-[#8a5a08]">
          Datos degradados: {degradation}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-[#176b4d] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e4935]"
        >
          Imprimir
        </button>
        <button
          type="button"
          onClick={() => alert("Reporte preparado para exportar.")}
          className="rounded-lg border border-[#9fbaa6] bg-white px-4 py-2 text-xs font-bold text-[#176b4d] hover:border-[#176b4d]"
        >
          Exportar
        </button>
      </div>
    </section>
  );
}

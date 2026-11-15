"use client";

export interface AIRecommendationProps {
  parcelId: string;
  parcelName: string;
  sowingWindow?: string;
  droughtAlertLevel?: "Baja" | "Moderada" | "Alta";
  confidence?: number;
  llmSummary?: string;
}

export default function AIRecommendationPanel({ parcelId, parcelName, sowingWindow = "22 mayo – 04 junio", droughtAlertLevel = "Moderada", confidence = 84, llmSummary = "La humedad del suelo y la lluvia acumulada indican condiciones favorables. Se recomienda una variedad de ciclo intermedio y revisar la retención de humedad cada semana." }: AIRecommendationProps) {
  const alertStyle = droughtAlertLevel === "Alta" ? "bg-[#fce1dc] text-[#a33b2f]" : droughtAlertLevel === "Moderada" ? "bg-[#fff0cf] text-[#8a5a08]" : "bg-[#d7edb4] text-[#176b4d]";
  return <section className="rounded-xl border border-[#cbd9ce] bg-[#e8f1df] p-5">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#cbd9ce] pb-4">
      <div><p className="text-xs font-bold uppercase tracking-wider text-[#176b4d]">Recomendación</p><h2 className="mt-1 text-xl font-extrabold">{parcelName} <span className="font-normal text-[#647269]">/{parcelId}</span></h2></div>
      <div className="flex gap-2 text-xs font-bold"><span className={`rounded-full px-3 py-1.5 ${alertStyle}`}>Sequía: {droughtAlertLevel}</span><span className="rounded-full bg-white px-3 py-1.5 text-[#176b4d]">Confianza {confidence}%</span></div>
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-[.8fr_1.2fr]">
      <div className="rounded-lg bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#647269]">Ventana de siembra</p><p className="mt-2 text-2xl font-extrabold text-[#176b4d]">{sowingWindow}</p><p className="mt-2 text-xs text-[#647269]">Basada en lluvia acumulada mayor a 35 mm.</p></div>
      <div className="rounded-lg bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#647269]">Lectura del modelo</p><p className="mt-2 text-sm leading-relaxed text-[#17231c]">{llmSummary}</p></div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => window.print()} className="rounded-lg bg-[#176b4d] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e4935]">Imprimir</button><button type="button" onClick={() => alert("Reporte preparado para exportar.")} className="rounded-lg border border-[#9fbaa6] bg-white px-4 py-2 text-xs font-bold text-[#176b4d] hover:border-[#176b4d]">Exportar</button></div>
  </section>;
}

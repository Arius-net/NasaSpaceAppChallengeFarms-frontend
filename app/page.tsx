import Link from "next/link";

// Renderiza la vista principal de bienvenida de K'INAL con accesos directos a los módulos base.
export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-2xl space-y-6">
        <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium tracking-wide text-emerald-400">
          LA FRAILESCA, CHIAPAS · MAÍZ DE TEMPORAL
        </span>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          K&apos;INAL
        </h1>

        <p className="text-base leading-relaxed text-slate-400 sm:text-lg">
          Plataforma de inteligencia agroclimática para orientación en fecha de
          siembra y alerta temprana de sequía mediante datos satelitales de la
          NASA (POWER, SMAP, IMERG) y recomendaciones agronómicas asistidas por
          IA.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

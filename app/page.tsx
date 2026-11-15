import Link from "next/link";

// Renderiza la Landing Page de K'INAL con la barra de navegacion y la seccion Hero principal.
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                K&apos;INAL
              </span>
              <span className="ml-2 hidden text-xs text-slate-400 sm:inline">
                Earth Observation &amp; Agricultural Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Crear Cuenta
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-900 py-24 px-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.25), transparent 60%)",
            }}
          />

          <div className="relative mx-auto max-w-4xl text-center space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Maíz de Temporal · La Frailesca, Chiapas
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              K&apos;INAL:{" "}
              <span className="text-emerald-400">
                Observación de la Tierra e Inteligencia Agrícola
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Inspirado en el vocablo maya para la <strong>&ldquo;tierra&rdquo;</strong>,
              K&apos;INAL es una plataforma SaaS de apoyo a la decisión agrícola que
              integra telemetría satelital de la NASA con el historial de cada
              parcela para orientar la fecha de siembra y emitir alertas tempranas
              de sequía.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/dashboard"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/50 transition hover:bg-emerald-500"
              >
                Explorar Dashboard Interactivo
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                Registrar Parcela
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

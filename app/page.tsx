import Link from "next/link";

const PROBLEM_CARDS = [
  {
    titulo: "Lluvias Irregulares",
    descripcion:
      "La variabilidad interanual altera el calendario tradicional de siembra en Villaflores, Villa Corzo y La Concordia.",
  },
  {
    titulo: "Falsos Inicios de Temporal",
    descripcion:
      "Primeras precipitaciones aisladas detonan siembras prematuras que fracasan por falta de humedad radicular sostenida.",
  },
  {
    titulo: "Impacto de la Canícula",
    descripcion:
      "La sequía intraestival en etapas críticas de floración y llenado de grano compromete severamente el rendimiento.",
  },
];

const SOLUTION_CARDS = [
  {
    tag: "NASA POWER",
    titulo: "Radiación y Temperatura",
    descripcion:
      "Monitoreo de temperatura superficial, radiación solar y balance térmico diario para estimar evapotranspiración.",
  },
  {
    tag: "NASA SMAP",
    titulo: "Humedad de Suelo",
    descripcion:
      "Lecturas satelitales de humedad en la zona radicular para distinguir lluvias superficiales de recarga hídrica real.",
  },
  {
    tag: "NASA IMERG",
    titulo: "Precipitación Satelital",
    descripcion:
      "Series de lluvia acumulada y detección de anomalías pluviales en tiempo cuasi-real sobre La Frailesca.",
  },
  {
    tag: "IA Generativa (RAG)",
    titulo: "Síntesis con Historial de Parcela",
    descripcion:
      "Cruza las tres fuentes de la NASA con la bitácora histórica del predio para redactar recomendaciones transparentes.",
  },
];

// Renderiza la Landing Page completa de K'INAL con Hero, Problema, Solucion NASA, CTA y Footer.
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
              href="/dashboard"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:inline-block"
            >
              Dashboard
            </Link>
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

        <section className="mx-auto max-w-6xl px-6 py-20 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              El Problema en La Frailesca, Chiapas
            </span>
            <h2 className="text-3xl font-bold text-white">
              Sembrar maíz de temporal ya no puede depender solo del calendario histórico
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Los productores enfrentan ventanas de siembra cada vez más estrechas
              debido a lluvias irregulares, falsos inicios de temporal y el riesgo
              latente de la canícula.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PROBLEM_CARDS.map((item) => (
              <div
                key={item.titulo}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
              >
                <h3 className="text-lg font-bold text-white">{item.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {item.descripcion}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-900 bg-slate-900/30 py-20 px-6">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Nuestra Solución · Datos NASA + IA (RAG)
              </span>
              <h2 className="text-3xl font-bold text-white">
                Evidencia satelital cruzada con la memoria de tu parcela
              </h2>
              <p className="text-sm leading-relaxed text-slate-400">
                K&apos;INAL unifica tres misiones de observación terrestre de la NASA
                con inteligencia artificial generativa para traducir variables
                climáticas complejas en escenarios agronómicos claros.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SOLUTION_CARDS.map((card) => (
                <div
                  key={card.tag}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-400">
                      {card.tag}
                    </span>
                    <h3 className="mt-4 text-base font-bold text-white">
                      {card.titulo}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {card.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-8 text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                Nuestra Filosofía de Decisión
              </p>
              <blockquote className="text-xl font-bold italic text-white sm:text-2xl">
                &ldquo;El sistema presenta evidencia, incertidumbre y opciones; la
                persona decide.&rdquo;
              </blockquote>
              <div className="pt-2 flex flex-wrap justify-center gap-4">
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-700 bg-slate-950 px-5 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-500"
                >
                  Acceder a mi cuenta
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Ver Demo en Vivo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <span className="font-bold text-white">K&apos;INAL</span>
            <p className="mt-1 text-xs text-slate-500">
              Earth Observation &amp; Agricultural Intelligence · Maíz de temporal en La Frailesca, Chiapas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-400">
            <Link href="/login" className="hover:text-emerald-400">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="hover:text-emerald-400">
              Registro de Productores
            </Link>
            <Link href="/dashboard" className="hover:text-emerald-400">
              Visor Agroclimático
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

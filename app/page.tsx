import Link from "next/link";

const DATA_SOURCES = [
  ["01", "NASA POWER", "Temperatura y radiación"],
  ["02", "NASA SMAP", "Humedad en suelo"],
  ["03", "NASA IMERG", "Lluvia acumulada"],
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f8f3]">
      <header className="border-b border-[#dce4dc] bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#176b4d] text-sm font-bold text-white">K</span>
            <span className="text-lg font-extrabold tracking-tight text-[#17231c]">K&apos;INAL</span>
          </Link>
          <div className="flex items-center gap-5 text-sm font-semibold">
            <Link href="/dashboard" className="hidden text-[#647269] hover:text-[#176b4d] sm:inline">Dashboard</Link>
            <Link href="/dashboard" className="rounded-lg bg-[#176b4d] px-4 py-2.5 text-white hover:bg-[#0e4935]">Probar Demo Interactiva</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-10 lg:pt-24">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#176b4d]">Decisiones agrícolas con datos</p>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.04] tracking-tight text-[#17231c] sm:text-7xl">
              Siembra con más certeza.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#647269]">
              K&apos;INAL convierte datos satelitales en recomendaciones claras para tus parcelas de maíz en La Frailesca.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-lg bg-[#176b4d] px-5 py-3 text-sm font-bold text-white hover:bg-[#0e4935]">Probar Demo Interactiva</Link>
              <Link href="/dashboard" className="rounded-lg border border-[#b8c8bc] bg-white px-5 py-3 text-sm font-bold text-[#176b4d] hover:border-[#176b4d]">Ver visor satelital</Link>
            </div>
            <div className="mt-12 flex items-center gap-8 border-t border-[#dce4dc] pt-6">
              <div><p className="text-2xl font-extrabold text-[#17231c]">3</p><p className="text-xs text-[#647269]">fuentes NASA</p></div>
              <div><p className="text-2xl font-extrabold text-[#17231c]">24 h</p><p className="text-xs text-[#647269]">actualización</p></div>
              <div><p className="text-2xl font-extrabold text-[#17231c]">84%</p><p className="text-xs text-[#647269]">confianza media</p></div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#cbd9ce] bg-[#e8f1df] p-5 shadow-sm">
            <div className="rounded-xl border border-[#cbd9ce] bg-white p-5">
              <div className="flex items-center justify-between border-b border-[#e5ebe5] pb-4">
                <div><p className="text-xs font-bold uppercase tracking-wider text-[#647269]">Parcela activa</p><p className="mt-1 text-lg font-bold">El Sabinal</p></div>
                <span className="rounded-full bg-[#d7edb4] px-3 py-1 text-xs font-bold text-[#176b4d]">Óptimo</span>
              </div>
              <div className="my-5 flex h-48 items-center justify-center rounded-lg bg-[#dcead4]">
                <div className="h-28 w-52 rotate-[-4deg] border-2 border-[#176b4d] bg-[#b9db91] p-3 text-center shadow-[8px_8px_0_#9cc878]">
                  <p className="mt-8 text-xs font-bold text-[#0e4935]">FRA-01</p>
                  <p className="text-[11px] text-[#176b4d]">Villaflores</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-[#f7f8f3] p-3"><p className="text-lg font-extrabold">NASA</p><p className="text-[11px] text-[#647269]">temperatura</p></div>
                <div className="rounded-lg bg-[#f7f8f3] p-3"><p className="text-lg font-extrabold">NASA</p><p className="text-[11px] text-[#647269]">humedad</p></div>
                <div className="rounded-lg bg-[#f7f8f3] p-3"><p className="text-lg font-extrabold">NASA</p><p className="text-[11px] text-[#647269]">lluvia</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#dce4dc] bg-white">
          <div className="mx-auto grid max-w-7xl gap-0 px-6 lg:grid-cols-3 lg:px-10">
            {DATA_SOURCES.map(([number, title, description]) => (
              <div key={title} className="flex gap-4 border-b border-[#dce4dc] py-7 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0">
                <span className="text-sm font-bold text-[#f0ad3d]">{number}</span>
                <div><h2 className="font-bold text-[#17231c]">{title}</h2><p className="mt-1 text-sm text-[#647269]">{description}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#176b4d]">Cómo funciona</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight">De la imagen al campo</h2></div>
            <p className="max-w-md text-sm leading-relaxed text-[#647269]">Una vista simple para entender el clima, comparar parcelas y decidir el siguiente paso.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["01", "Selecciona", "Elige una parcela y revisa su historial."],
              ["02", "Compara", "Consulta las capas satelitales en un solo lugar."],
              ["03", "Decide", "Recibe una ventana de siembra explicada."],
            ].map(([number, title, text]) => <article key={number} className="rounded-xl border border-[#dce4dc] bg-white p-6"><span className="text-sm font-bold text-[#f0ad3d]">{number}</span><h3 className="mt-8 text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[#647269]">{text}</p></article>)}
          </div>
        </section>
      </main>
      <footer className="border-t border-[#dce4dc] bg-[#17231c] px-6 py-8 text-sm text-[#d7e3d8]"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row"><span className="font-bold text-white">K&apos;INAL</span><span>Datos para cultivar mejor · La Frailesca, Chiapas</span></div></footer>
    </div>
  );
}

"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Renderiza la pantalla de inicio de sesion con validacion basica de credenciales.
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Procesa el envio del formulario de acceso y redirige al dashboard principal.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 400);
  };

  return (
    <main className="flex-1 flex items-center justify-center bg-[#f7f8f3] px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-[#dce4dc] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-[#e8f1df] px-3 py-1 text-xs font-bold text-[#176b4d]">
            K&apos;INAL · ACCESO
          </span>
          <h1 className="mt-3 text-2xl font-extrabold">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-[#647269]">
            Consulta tus parcelas y recomendaciones
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-[#647269]"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="productor@frailesca.mx"
              className="mt-1.5 w-full rounded-lg border border-[#cbd9ce] bg-white px-3.5 py-2.5 text-sm text-[#17231c] placeholder-[#9aaba0] focus:border-[#176b4d] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-[#647269]"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-lg border border-[#cbd9ce] bg-white px-3.5 py-2.5 text-sm text-[#17231c] placeholder-[#9aaba0] focus:border-[#176b4d] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#176b4d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0e4935] disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#647269]">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-bold text-[#176b4d] hover:text-[#0e4935]"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}

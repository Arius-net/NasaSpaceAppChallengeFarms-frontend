import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "K'INAL | Apoyo a la Decisión Agrícola — La Frailesca, Chiapas",
  description:
    "Plataforma SaaS de orientación para fecha de siembra y alerta de sequía en maíz de temporal integrando NASA POWER, SMAP, IMERG e IA Generativa.",
};

// Renderiza la estructura HTML raíz y aplica la tipografía base global a toda la aplicación.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}

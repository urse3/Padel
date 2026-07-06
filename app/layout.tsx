import type { Metadata } from "next";
import { Kanit, Inter } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-kanit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Punto de Padel · Tu ranking privado",
  description: "La plataforma de pádel para tu comunidad. Registra partidos, sube de nivel y compite en torneos.",
  keywords: ["padel", "ranking", "torneos", "matchmaking", "pádel"],
  openGraph: {
    title: "Punto de Padel",
    description: "La plataforma de pádel para tu comunidad",
    type: "website",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'><circle cx='132' cy='52' r='16' fill='%2322c55e'/><path d='M48 148L64 132' stroke='%2322c55e' stroke-width='8.5' stroke-linecap='round'/><path d='M70 126C60 116 57 101 62 88C67 75 79 67 93 65C108 63 122 71 126 84C130 97 126 112 116 120L70 126Z' stroke='%2322c55e' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${kanit.variable} ${inter.variable}`}>
      <body className="font-inter antialiased bg-surface-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

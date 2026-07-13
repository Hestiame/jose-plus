import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "José+ | Assistente escolar",
  description: "Assistente escolar inteligente conectado aos dados da escola."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-body bg-zinc-950 text-zinc-100 min-h-screen">{children}</body>
    </html>
  );
}

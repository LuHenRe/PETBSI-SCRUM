import "./globals.css";
import type { Metadata } from "next";
import { StoreHydrator } from "@/components/store-hydrator";

export const metadata: Metadata = {
  title: "PETBSI Scrum — Gestão Ágil do Projeto",
  description:
    "Frontend de demonstração do sistema de gestão ágil do projeto acadêmico PETBSI.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
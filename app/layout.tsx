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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("petbsi-theme");var d=t?t==="dark":window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.setAttribute("data-theme","dark");}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
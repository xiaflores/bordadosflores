import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bordados Flores - Tradición y Cultura Boliviana",
  description: "Plataforma premium de comercio electrónico dedicada a la preservación y venta de textiles artesanales auténticos de Bolivia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-surface font-body-md text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
        {children}
      </body>
    </html>
  );
}

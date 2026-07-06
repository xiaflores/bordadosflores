import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";

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
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&family=Be+Vietnam+Pro:wght@400;600&display=swap"
          rel="stylesheet"
        />
        {/* Material Symbols Outlined */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* Boxicons CDN */}
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />
      </head>
      <body className="min-h-full bg-surface font-body-md text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}


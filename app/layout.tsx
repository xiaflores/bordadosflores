import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bordadosflores.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bordados Flores - Tradición y Cultura Boliviana",
    template: "%s | Bordados Flores"
  },
  description: "Plataforma premium de comercio electrónico dedicada a la preservación y venta de textiles artesanales auténticos de Bolivia. Polleras, chaquetas y accesorios hechos a mano en Oruro.",
  keywords: ["bordados flores", "polleras bolivianas", "polleras de chola", "textiles bolivia", "artesania boliviana", "oruro", "moda folclorica"],
  openGraph: {
    title: "Bordados Flores - Tradición y Cultura Boliviana",
    description: "Plataforma premium de comercio electrónico dedicada a la preservación y venta de textiles artesanales auténticos de Bolivia.",
    url: siteUrl,
    siteName: "Bordados Flores",
    locale: "es_BO",
    type: "website",
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3ok8RTRW6cxAwh3XQHvYm7TksIbjQh3YubTN36ArE6tF08MCC8HlXkIUW0_YTMInNFCFsbepuAqKZSAX2wZuKDek8FNUAwZ12jfnexWvaopWv-8w5bvzb3qxHfbhOH_22TF5yUOEn1r2JlAB7zdFmLw378ufoL6e4xPoOnwdHeO7TMX8ae2o6JziZz5YSiirkKu_3X93IWYW3yY1MSKgpiwXaS4gUe7oxaQ49AlE9bouNy1346D4EgxeSbQzw1cB2-Pg2F0P_kA",
        width: 800,
        height: 800,
        alt: "Bordados Flores Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Bordados Flores - Tradición y Cultura Boliviana",
    description: "Plataforma premium de comercio electrónico dedicada a la preservación y venta de textiles artesanales auténticos de Bolivia.",
    creator: "@bordadosflores1",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA3ok8RTRW6cxAwh3XQHvYm7TksIbjQh3YubTN36ArE6tF08MCC8HlXkIUW0_YTMInNFCFsbepuAqKZSAX2wZuKDek8FNUAwZ12jfnexWvaopWv-8w5bvzb3qxHfbhOH_22TF5yUOEn1r2JlAB7zdFmLw378ufoL6e4xPoOnwdHeO7TMX8ae2o6JziZz5YSiirkKu_3X93IWYW3yY1MSKgpiwXaS4gUe7oxaQ49AlE9bouNy1346D4EgxeSbQzw1cB2-Pg2F0P_kA"
    ]
  }
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

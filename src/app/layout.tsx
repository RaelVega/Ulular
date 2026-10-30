import type { Metadata, Viewport } from "next";
import {
  Cinzel,
  JetBrains_Mono,
  Montserrat,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-cinzel",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ulular · Sala de Ensayo en Querétaro | $150/h",
    template: "%s · Ulular Sala de Ensayo",
  },
  description:
    "Sala de ensayo en Querétaro ($150/h, mínimo 1 hora). Renta de backline, fotografía y sesiones en vivo. Aparta tu horario en línea.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/brand/favicon-dark-lines.png",
        media: "(prefers-color-scheme: light)",
        type: "image/png",
      },
      {
        url: "/brand/favicon-light-lines.png",
        media: "(prefers-color-scheme: dark)",
        type: "image/png",
      },
    ],
    shortcut: "/brand/favicon-dark-lines.png",
    apple: "/brand/ulular-original.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${montserrat.variable} ${cinzel.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased selection:bg-bone selection:text-ink">
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { DM_Sans, Outfit } from "next/font/google";

import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HYROX Maastricht — Doubles training",
  description:
    "Trainingsdashboard voor HYROX Doubles Maastricht (MECC, september 2026).",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "HYROX",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  icons: {
    icon: [{ url: "/icons/pwa-192.svg", type: "image/svg+xml" }],
    apple: [
      { url: "/icons/pwa-192.svg" },
      { url: "/icons/pwa-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${outfit.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AnalyticsScripts />
        {children}
      </body>
    </html>
  );
}

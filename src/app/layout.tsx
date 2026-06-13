import "./globals.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { RootClient } from "@/components/RootClient";

export const metadata: Metadata = {
  title: "DaanSetu AI",
  description: "AI-powered bridge between donors, NGOs, and urgent community needs.",
  applicationName: "DaanSetu AI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DaanSetu AI",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0F8F5F",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootClient>{children}</RootClient>
      </body>
    </html>
  );
}

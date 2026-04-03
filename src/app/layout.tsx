import type { Metadata, Viewport } from "next";
import "./globals.css";

import { DeviceMotionConfig } from "@/components/DeviceMotionConfig";
import { DeviceDensityConfig } from "@/components/DeviceDensityConfig";
import { Header, BottomNav } from "@/components/MobileShell";
import {
  AppearanceClient,
  ServiceWorkerRegistration,
} from "@/components/SystemLayer";
import { ThemeProvider, LocaleProvider } from "@/lib/client";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "Swinburne App",
  description: "Swinburne campus navigation and support app",
};

export const viewport: Viewport = {
  themeColor: "#F2F2F7",
  colorScheme: "light",
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh bg-[#F2F2F7] font-sans text-slate-900">
        <ThemeProvider>
          <LocaleProvider>
            <DeviceDensityConfig />
            <DeviceMotionConfig>
              <a
                href="#content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 rounded-md bg-white px-3 py-2 text-slate-900 shadow"
              >
                Skip to content
              </a>

              <Header />

              <main
                id="content"
                className="main-shell max-w container-px overscroll-y-contain pb-[calc(env(safe-area-inset-bottom)+6.2rem)]"
              >
                {children}
              </main>

              <BottomNav />
              <AppearanceClient />
              <ServiceWorkerRegistration />
            </DeviceMotionConfig>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
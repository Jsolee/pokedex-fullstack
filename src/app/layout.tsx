import type { Metadata } from "next";
import { Press_Start_2P, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { MainNavigation } from "@/components/navigation/main-navigation";
import { WallpaperController } from "@/components/ui/wallpaper-controller";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Mini Pokédex",
  description: "Pixel-perfect Pokédex with Supabase caching",
  metadataBase: new URL("https://pokedex-fullstack.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${pixel.variable} ${sans.variable} bg-gameboy-grid text-foreground antialiased`}
      >
        <WallpaperController />
        <div className="gameboy-shell min-h-screen rounded-[32px] px-4 py-6 text-base text-emerald-50 shadow-2xl sm:px-8">
          <main className="mx-auto max-w-6xl space-y-6">
            <MainNavigation className="sticky top-4 z-10" />
            {children}
          </main>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

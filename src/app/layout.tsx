import type { Metadata } from "next";
import Image from "next/image";
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
        <div className="gameboy-shell min-h-screen rounded-[32px] px-4 pb-4 pt-0 text-base text-emerald-50 shadow-2xl sm:px-8">
          <main className="mx-auto flex max-w-6xl flex-col gap-6">
            <div className="flex flex-col gap-0">
              <div className="flex justify-center -mt-0.5 -mb-0.5 sm:-mt-1 sm:-mb-1">
                <Image
                  src="/branding/RetroDex.webp"
                  alt="RetroDex"
                  width={424}
                  height={112}
                  priority
                  className="block h-auto w-[56%] sm:w-[36%]"
                />
              </div>
              <MainNavigation className="sticky top-4 z-10 mt-1 sm:mt-2" />
            </div>
            {children}
          </main>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

"use client";

import { useEffect } from "react";

import { BACKGROUND_WALLPAPERS } from "@/lib/constants";

export function WallpaperController() {
  useEffect(() => {
    if (!BACKGROUND_WALLPAPERS.length) {
      return;
    }

    const index = Math.floor(Math.random() * BACKGROUND_WALLPAPERS.length);
    const wallpaper = BACKGROUND_WALLPAPERS[index];
    document.documentElement.style.setProperty("--wallpaper-image", `url('${wallpaper}')`);
  }, []);

  return null;
}

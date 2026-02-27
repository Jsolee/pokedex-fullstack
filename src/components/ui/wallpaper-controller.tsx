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
    const root = document.documentElement;
    let isMounted = true;

    const applyWallpaper = () => {
      if (!isMounted) return;
      root.style.setProperty("--wallpaper-image", `url('${wallpaper.src}')`);
    };

    const image = new Image();
    image.decoding = "async";
    image.src = wallpaper.src;

    if (image.complete) {
      applyWallpaper();
    } else {
      image.addEventListener("load", applyWallpaper);
      image.addEventListener("error", applyWallpaper);
    }

    return () => {
      isMounted = false;
      image.removeEventListener("load", applyWallpaper);
      image.removeEventListener("error", applyWallpaper);
    };
  }, []);

  return null;
}

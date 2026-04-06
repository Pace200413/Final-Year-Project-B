"use client";

import { useEffect } from "react";
import { useDevicePrefs } from "@/lib/device-prefs";

export function DeviceDensityConfig() {
  const { prefs } = useDevicePrefs();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("a11y-density-compact", prefs.compactMode);

    return () => {
      root.classList.remove("a11y-density-compact");
    };
  }, [prefs.compactMode]);

  return null;
}
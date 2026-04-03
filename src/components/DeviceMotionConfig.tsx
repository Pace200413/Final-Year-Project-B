"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { useDevicePrefs } from "@/lib/device-prefs";

export function DeviceMotionConfig({ children }: { children: ReactNode }) {
  const { prefs } = useDevicePrefs();
  return (
    <MotionConfig reducedMotion={prefs.reduceMotion ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}

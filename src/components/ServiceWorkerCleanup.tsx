// src/components/ServiceWorkerCleanup.tsx
"use client";

import { useEffect } from "react";

export default function ServiceWorkerCleanup() {
  useEffect(() => {
    const run = async () => {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((reg) => reg.unregister()));
      }

      if ("caches" in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((key) => window.caches.delete(key)));
      }

      if (!sessionStorage.getItem("sw-cleanup-done")) {
        sessionStorage.setItem("sw-cleanup-done", "1");
        window.location.reload();
      }
    };

    run().catch(console.error);
  }, []);

  return null;
}
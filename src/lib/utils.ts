// lib/utils.ts

// Keep these tiny unions here so this file stays usable on BOTH server + client
// (and doesn't depend on "@/lib/client" which is "use client").
export type TimeFormat = "12h" | "24h";
export type DateFormat = "short" | "long";
export type TemperatureUnit = "celsius" | "fahrenheit";

/* ------------------------------------------------------------------ */
/* Formatting (from format.ts)                                         */
/* ------------------------------------------------------------------ */

export function formatTime(date: Date, timeFormat: TimeFormat = "12h"): string {
  if (timeFormat === "24h") {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date: Date, dateFormat: DateFormat = "short"): string {
  if (dateFormat === "long") {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "numeric",
  });
}

export function formatDateTime(
  date: Date,
  timeFormat: TimeFormat = "12h",
  dateFormat: DateFormat = "short"
): string {
  return `${formatDate(date, dateFormat)} • ${formatTime(date, timeFormat)}`;
}

export function formatTemperature(
  celsius: number,
  unit: TemperatureUnit = "celsius"
): string {
  if (unit === "fahrenheit") {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

/* ------------------------------------------------------------------ */
/* Time helpers (from formatTime.ts + time.ts)                         */
/* ------------------------------------------------------------------ */

export function formatTimeForDisplay(date: string | number | Date): string {
  const value =
    typeof date === "string" || typeof date === "number" ? new Date(date) : date;

  if (Number.isNaN(value.getTime())) return "";

  return new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(value)
    .replace(" am", " AM")
    .replace(" pm", " PM");
}

// Deterministic date formatting to avoid SSR/CSR mismatches.
const fmtUTC = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function formatAt(iso: string) {
  try {
    return fmtUTC.format(new Date(iso));
  } catch {
    return iso;
  }
}

/* ------------------------------------------------------------------ */
/* Maps (from maps.ts)                                                 */
/* ------------------------------------------------------------------ */

/** Build a Google Maps Search URL from coordinates or an address. */
export function gmSearchUrl(input: { address?: string; lat?: number; lng?: number }) {
  if (input.lat != null && input.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${input.lat},${input.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    input.address ?? ""
  )}`;
}

/** Build a Google Maps Directions URL from coordinates or an address. */
export function gmDirectionsUrl(dest: { lat?: number; lng?: number; address?: string }) {
  if (dest.lat != null && dest.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    dest.address ?? ""
  )}`;
}
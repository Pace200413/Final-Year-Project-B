import { NAV_DESTINATIONS } from "@/data/navigation-destinations";

/** Get the navigation href for a destination key, or null if not found. */
export function getNavHrefForPlace(destKey: string): string | null {
  const key = (destKey ?? "").trim();
  const dest = NAV_DESTINATIONS.find(
    (d) => d.key === key || d.key.toLowerCase() === key.toLowerCase()
  );
  return dest?.href ?? null;
}

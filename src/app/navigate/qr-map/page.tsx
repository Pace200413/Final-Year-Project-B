"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubpageLayout } from "@/components/SupportUI";
import { FaMapMarkerAlt, FaWalking } from "react-icons/fa";

/* ===== Types & data ===== */

type LocationKey = "lobby" | "atrium" | "library" | "mph" | "gblock";

type Location = {
  key: LocationKey;
  label: string;
  description: string;
  x: number;
  y: number;
  routeHref: string;
};

const LOCATIONS: Location[] = [
  {
    key: "lobby",
    label: "Main Lobby",
    description: "Campus main entrance and reception area.",
    x: 50.0,
    y: 58.04,
    routeHref: "/navigate/map?from=lobby&to=lobby",
  },
  {
    key: "atrium",
    label: "Borneo Atrium",
    description: "Event space and open hangout area between Block A and B.",
    x: 56.5,
    y: 70.69,
    routeHref: "/navigate/borneoatrium",
  },
  {
    key: "library",
    label: "Library",
    description: "Resources, quiet zones and study rooms.",
    x: 50.0,
    y: 48.58,
    routeHref: "/navigate/library",
  },
  {
    key: "mph",
    label: "Multi Purpose Hall",
    description: "Exams, events and large assemblies.",
    x: 38.7,
    y: 47.92,
    routeHref: "/navigate/mph",
  },
  {
    key: "gblock",
    label: "G Block (IT & Student Service)",
    description: "IT department, labs and student service counters.",
    x: 54.22,
    y: 39.0,
    routeHref: "/navigate/gblock",
  },
];

function findLocation(key: string | null): Location | undefined {
  if (!key) return undefined;
  return LOCATIONS.find((l) => l.key === key);
}

/* ===== Inner component (uses useSearchParams) ===== */

function QrMapInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const startKeyFromQr = searchParams.get("start"); // e.g. ?start=lobby
  const startLocation = useMemo(
    () => findLocation(startKeyFromQr) ?? findLocation("lobby")!,
    [startKeyFromQr]
  );

  const [selectedKey, setSelectedKey] = useState<LocationKey | null>(null);

  const selectedLocation = useMemo(
    () => (selectedKey ? findLocation(selectedKey) ?? null : null),
    [selectedKey]
  );

  // Auto-pick nearest location (only if user didn't pick anything yet)
  useEffect(() => {
    if (!startLocation || selectedKey) return;

    const nearest = LOCATIONS.filter((l) => l.key !== startLocation.key).reduce<Location | null>(
      (best, current) => {
        if (!best) return current;
        const dBest = (best.x - startLocation.x) ** 2 + (best.y - startLocation.y) ** 2;
        const dCur = (current.x - startLocation.x) ** 2 + (current.y - startLocation.y) ** 2;
        return dCur < dBest ? current : best;
      },
      null
    );

    if (nearest) setSelectedKey(nearest.key);
  }, [startLocation, selectedKey]);

  const destinations = useMemo(
    () => LOCATIONS.filter((l) => l.key !== startLocation.key),
    [startLocation.key]
  );

  const handleStartRoute = () => {
    if (!selectedLocation) return;
    router.push(selectedLocation.routeHref);
  };

  return (
    <SubpageLayout
      icon={<FaMapMarkerAlt className="h-5 w-5" />}
      title="QR Map"
      description="Choose a destination and start navigation."
    >
      <div className="space-y-4">
        {/* Start + Selected */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="text-xs text-slate-500">Start location</div>
            <div className="mt-1 text-[15px] font-semibold text-slate-900">{startLocation.label}</div>
            <div className="mt-1 text-sm text-slate-600">{startLocation.description}</div>
            <div className="mt-2 text-xs text-slate-500">
              Coords: ({startLocation.x.toFixed(2)}, {startLocation.y.toFixed(2)})
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="text-xs text-slate-500">Destination</div>
            <div className="mt-1 text-[15px] font-semibold text-slate-900">
              {selectedLocation ? selectedLocation.label : "Select a destination"}
            </div>
            <div className="mt-1 text-sm text-slate-600">
              {selectedLocation ? selectedLocation.description : "Pick from the list below."}
            </div>

            <button
              onClick={handleStartRoute}
              disabled={!selectedLocation}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium
                         bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-white/80"
            >
              <FaWalking className="h-4 w-4" />
              Start route
            </button>

            <div className="mt-2 text-xs text-slate-500">
              Tip: we auto-suggest the nearest place — you can change it anytime.
            </div>
          </div>
        </div>

        {/* Destination list */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="mb-2 text-[15px] font-semibold">Choose destination</div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((l) => {
              const active = l.key === selectedKey;
              return (
                <li key={l.key}>
                  <button
                    type="button"
                    onClick={() => setSelectedKey(l.key)}
                    className={[
                      "w-full text-left rounded-2xl p-3 ring-1 transition",
                      active
                        ? "bg-[#D42A30]/5 ring-[#D42A30]/30"
                        : "bg-white ring-slate-200 hover:ring-slate-300",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900">{l.label}</div>
                        <div className="mt-0.5 text-sm text-slate-600 line-clamp-2">{l.description}</div>
                        <div className="mt-2 text-xs text-slate-500">
                          Coords: ({l.x.toFixed(2)}, {l.y.toFixed(2)})
                        </div>
                      </div>
                      <span
                        className={[
                          "mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ring-1",
                          active ? "bg-[#D42A30] text-white ring-[#D42A30]/40" : "bg-white ring-slate-200",
                        ].join(" ")}
                        aria-hidden
                      >
                        {active ? "✓" : ""}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </SubpageLayout>
  );
}

/* ===== Page export (wrap with Suspense) ===== */

export default function QrMapPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <QrMapInner />
    </Suspense>
  );
}
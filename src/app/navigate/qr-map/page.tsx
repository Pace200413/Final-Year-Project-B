"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubpageLayout } from "@/components/SupportUI";
import { FaMapMarkerAlt, FaWalking } from "react-icons/fa";

/* ===== Types & data ===== */

type LocationKey = "lobby" | "atrium" | "library" | "mph" | "gblock" | "shq" | "junction" | "shub" | "dining" | "sv";

type Location = {
  key: LocationKey;
  label: string;
  description: string;
  routeHref: string;
};

const LOCATIONS: Location[] = [
  {
    key: "lobby",
    label: "Main Lobby",
    description: "Campus main entrance and reception area.",
    routeHref: "/navigate/map?from=lobby&to=lobby",
  },
  {
    key: "atrium",
    label: "Borneo Atrium",
    description: "Event space and open hangout area between Block A and B.",
    routeHref: "/navigate/borneoatrium",
  },
  {
    key: "library",
    label: "Library",
    description: "Resources, quiet zones and study rooms.",
    routeHref: "/navigate/library",
  },
  {
    key: "mph",
    label: "Multi Purpose Hall",
    description: "Exams, events and large assemblies.",
    routeHref: "/navigate/mph",
  },
  {
    key: "gblock",
    label: "G Block (IT & Student Service)",
    description: "IT department, labs and student service counters.",
    routeHref: "/navigate/gblock",
  },
  {
    key: "shq",
    label: "Student HQ",
    description: "Help desk & services.",
    routeHref: "/navigate/sHQ",
  },
  {
    key: "shub",
    label: "Student Hub",
    description: "Clubs & hangout space.",
    routeHref: "/navigate/shub",
  },
  {
    key: "junction",
    label: "Junction & Study Spaces",
    description: "Study places, group meeting rooms.",
    routeHref: "/navigate/study",
  },
  {
    key: "dining",
    label: "Dining Hall",
    description: "Breakfast and lunch here.",
    routeHref: "/navigate/dining",
  },
  {
    key: "sv",
    label: "Student Village",
    description: "Student accommondation blocks.",
    routeHref: "/navigate/studentvillage",
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
      <div className="col-span-full mx-auto w-full max-w-5xl space-y-4 px-4">

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <FaMapMarkerAlt className="text-[#D42A30]" />
            <span>You are at</span>
          </div>

          <div className="mt-1 text-lg font-semibold text-slate-900">
            {startLocation.label}
          </div>

          <div className="text-sm text-slate-500">
            Choose where you want to go
          </div>
        </div>

        {/* Start + Selected */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="text-xs text-slate-500">Destination</div>
          <div className="mt-1 text-[16px] font-semibold text-slate-900">
            {selectedLocation ? selectedLocation.label : "Select a destination"}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {selectedLocation ? selectedLocation.description : "Pick from the list below."}
          </div>

          <button
            onClick={handleStartRoute}
            disabled={!selectedLocation}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium
                      bg-[#D42A30] text-white hover:bg-[#b71f26] disabled:bg-slate-300 disabled:text-white/80"
          >
            <FaWalking className="h-4 w-4" />
            Start route
          </button>

          <div className="mt-2 text-xs text-slate-500">
            Tip: select a destination to begin your guided route.
          </div>
        </div>

        {/* Destination list */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="mb-2 text-[15px] font-semibold">Choose destination</div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((l) => {
              const active = l.key === selectedKey;
              return (
                <li key={l.key} className="h-full">
                  <button
                    type="button"
                    onClick={() => setSelectedKey(l.key)}
                    className={[
                      "h-full min-h-[124px] w-full text-left rounded-2xl p-4 hover:shadow-md hover:scale-[1.02] ring-1 transition-transform",
                      active
                        ? "bg-[#D42A30]/5 ring-[#D42A30]/30"
                        : "bg-white ring-slate-200 hover:ring-slate-300",
                    ].join(" ")}
                  >
                    <div className="flex h-full items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[16px] font-semibold text-slate-900">{l.label}</div>
                        <div className="mt-0.5 text-sm text-slate-600 line-clamp-2">{l.description}</div>
                        
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
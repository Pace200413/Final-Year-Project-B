"use client";

import { useEffect, useState } from "react";
import type { CampusEvent } from "@/lib/types";
import { useBookmarks } from "@/lib/client";
import { gmDirectionsUrl } from "@/lib/utils";

export default function EventActionBar({ ev }: { ev: CampusEvent }) {
  const { isSaved, toggle, mounted } = useBookmarks();
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const saved = mounted ? isSaved(ev.id) : false;

  useEffect(() => {
    const el = document.getElementById("event-hero-end");
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const venueStr = `${ev.venue.building}${ev.venue.level ? `, ${ev.venue.level}` : ""}${ev.venue.room ? `, ${ev.venue.room}` : ""}`;

  return (
    <>
      <div style={{ height: "56px" }} aria-hidden />
      <div
        className={`fixed bottom-0 inset-x-0 z-30 border-t bg-white/95 backdrop-blur pb-[max(env(safe-area-inset-bottom),0px)] transition-transform duration-150 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="maxw container-px py-2 grid grid-cols-3 gap-6">
          <a
            href={gmDirectionsUrl({
              lat: ev.lat,
              lng: ev.lng,
              address: venueStr,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-8 rounded-full bg-[var(--brand-red,#D42A30)] text-white px-3 text-xs font-medium"
            title="Directions in Google Maps"
          >
            Go
          </a>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!mounted) return;
              const wasSaved = saved;
              toggle(ev.id);
              setToast(!wasSaved ? "Saved to favourites" : "Removed from favourites");
              setTimeout(() => setToast(null), 2000);
            }}
            disabled={!mounted}
            className={`inline-flex items-center justify-center h-8 rounded-full border px-3 text-xs transition-all duration-200 ${
              saved
                ? "bg-[var(--brand-red,#D42A30)] text-white border-[var(--brand-red,#D42A30)] shadow-sm"
                : "bg-white text-slate-600 border-slate-300 hover:border-[var(--brand-red,#D42A30)] hover:text-[var(--brand-red,#D42A30)]"
            } ${!mounted ? "opacity-50" : ""}`}
            title={saved ? "Remove bookmark" : "Bookmark"}
          >
            <span suppressHydrationWarning>{saved ? "★ Saved" : "☆ Save"}</span>
          </button>

          <button
            onClick={async () => {
              const startDate = new Date(ev.date);
              const endDate = new Date(ev.endDate || ev.date);

              const calendarUrl = `webcal://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                ev.title
              )}&dates=${startDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${endDate
                .toISOString()
                .replace(/[-:]/g, "")
                .split(".")[0]}Z&details=${encodeURIComponent(ev.description || "")}&location=${encodeURIComponent(venueStr)}`;

              try {
                const calendarWindow = window.open(calendarUrl, "_blank");
                if (!calendarWindow || calendarWindow.closed || typeof calendarWindow.closed === "undefined") {
                  throw new Error("Calendar app blocked");
                }

                setToast("✓ Added to calendar");
                setTimeout(() => setToast(null), 2000);

                if ("vibrate" in navigator) navigator.vibrate(100);
              } catch {
                const d = (x: Date) => x.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
                const ics = [
                  "BEGIN:VCALENDAR",
                  "VERSION:2.0",
                  "PRODID:-//Swinburne//Events//EN",
                  "BEGIN:VEVENT",
                  `UID:${ev.id}@swin-app`,
                  `DTSTAMP:${d(startDate)}`,
                  `DTSTART:${d(startDate)}`,
                  `DTEND:${d(endDate)}`,
                  `SUMMARY:${ev.title}`,
                  `LOCATION:${venueStr}`,
                  `DESCRIPTION:${(ev.description || "").replace(/\n/g, "\\n")}`,
                  "END:VEVENT",
                  "END:VCALENDAR",
                ].join("\r\n");

                const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${ev.title.replace(/\s+/g, "_")}.ics`;
                a.click();
                URL.revokeObjectURL(url);

                setToast("Downloaded .ics file");
                setTimeout(() => setToast(null), 2000);
              }
            }}
            className="inline-flex items-center justify-center h-8 rounded-full border px-3 text-xs"
            title="Add to calendar"
          >
            ⋯
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-[9999] text-[11px] px-3 py-2 rounded-full bg-black/90 text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
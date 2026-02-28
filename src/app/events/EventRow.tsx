"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useState } from "react";
import type { CampusEvent } from "@/lib/types";
import { useBookmarks } from "@/lib/client";
import { useLocale } from "@/lib/client";
import { gmSearchUrl, formatTime, formatDate } from "@/lib/utils";

function tUTC(iso: string, timeFormat: "12h" | "24h" = "12h") {
  const d = new Date(iso);
  return formatTime(d, timeFormat);
}

function getEventStatus(event: CampusEvent) {
  const now = new Date();
  const start = new Date(event.date);
  const end = new Date(event.endDate || event.date);

  if (now >= start && now <= end) {
    return { status: "live", text: "Happening now", color: "text-green-600 bg-green-50" };
  } else if (now < start) {
    const diff = start.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return { status: "starting", text: `Starts in ${minutes}m`, color: "text-orange-600 bg-orange-50" };
  }

  return { status: "upcoming", text: "Add to calendar", color: "text-slate-600 bg-slate-50" };
}

function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    Orientation: "🎓",
    Workshop: "🔧",
    Club: "🎭",
    Talk: "💬",
    Sports: "⚽",
    Other: "📅",
  };
  return icons[category] || "📅";
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    Orientation: "from-blue-500 to-cyan-500",
    Workshop: "from-purple-500 to-pink-500",
    Club: "from-green-500 to-emerald-500",
    Talk: "from-orange-500 to-red-500",
    Sports: "from-yellow-500 to-orange-500",
    Other: "from-slate-500 to-gray-500",
  };
  return colors[category] || "from-slate-500 to-gray-500";
}

export default function EventRow({ ev }: { ev: CampusEvent }) {
  const { isSaved, toggle, mounted } = useBookmarks();
  const { settings: localeSettings, isLoaded } = useLocale();

  const [toast, setToast] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const saved = mounted ? isSaved(ev.id) : false;
  const eventStatus = getEventStatus(ev);

  const venueStr = `${ev.venue.building}${ev.venue.level ? `, ${ev.venue.level}` : ""}${ev.venue.room ? `, ${ev.venue.room}` : ""}`;

  const mapHref = gmSearchUrl({ lat: ev.lat, lng: ev.lng, address: venueStr });

  const onToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!mounted) return;

    const wasSaved = saved;
    toggle(ev.id);

    if (!wasSaved) {
      setToast("🎉 Saved to favourites");
      if (typeof window !== "undefined") {
        const confetti = document.createElement("div");
        confetti.innerHTML = "🎉";
        confetti.style.position = "fixed";
        confetti.style.left = e.clientX + "px";
        confetti.style.top = e.clientY + "px";
        confetti.style.pointerEvents = "none";
        confetti.style.zIndex = "9999";
        confetti.style.fontSize = "20px";
        confetti.style.animation = "confetti-fall 1s ease-out forwards";
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1000);
      }
    } else {
      setToast("Removed from favourites");
    }

    setTimeout(() => setToast(null), 2000);

    if ("vibrate" in navigator) navigator.vibrate(50);
  };

  const onAddToCalendar = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

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
  };

  const heroSrc = ev.images?.thumbnail || ev.images?.hero || "/images/swinburne-logo.jpg";

  return (
    <Link
      href={`/events/${ev.id}`}
      prefetch={false}
      className="block group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="flex">
          <div className="flex-shrink-0 w-12 sm:w-16 flex flex-col items-center justify-center py-3 sm:py-4 px-2 sm:px-3 bg-slate-50/50">
            <div className="text-xs font-mono text-slate-600 tabular-nums">
              {isLoaded ? tUTC(ev.date, localeSettings.timeFormat) : "--:--"}
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300 mt-1" />
          </div>

          <div className="flex-1 min-w-0 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {getCategoryIcon(ev.category)} {ev.category}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${eventStatus.color}`}>
                    {eventStatus.text}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-tight mb-1 line-clamp-2">
                  {ev.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 mb-1 truncate">📍 {venueStr}</p>

                {ev.description && <p className="hidden sm:block text-xs text-slate-500 mb-1 line-clamp-1">{ev.description}</p>}

                <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-500">
                  <span>{isLoaded ? formatDate(new Date(ev.date), localeSettings.dateFormat) : "--"}</span>
                  {ev.organizer && <span className="hidden sm:inline">by {ev.organizer}</span>}
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 ring-1 ring-slate-200/70 group-hover:ring-[var(--brand-red,#D42A30)] transition-all duration-300 shadow-sm">
                  {heroSrc ? (
                    <Image
                      src={heroSrc}
                      alt={ev.title}
                      width={80}
                      height={80}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                      onLoad={() => setImageLoaded(true)}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(ev.category)} flex items-center justify-center text-white text-xl`}>
                      {getCategoryIcon(ev.category)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col items-center justify-center p-2 sm:p-3 gap-1 sm:gap-2">
            <button
              onClick={onToggle}
              disabled={!mounted}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                saved ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md" : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              } ${!mounted ? "opacity-50" : ""}`}
              title={saved ? "Remove bookmark" : "Bookmark"}
            >
              <span className={`text-xs sm:text-sm transition-transform duration-200 ${saved ? "scale-110" : ""}`}>{saved ? "★" : "☆"}</span>
            </button>

            {eventStatus.status === "live" ? (
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-medium hover:bg-green-600 transition-colors"
                title="Get directions"
                onClick={(e) => e.stopPropagation()}
              >
                🗺️
              </a>
            ) : (
              <button
                onClick={onAddToCalendar}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-medium hover:bg-slate-800 transition-colors"
                title="Add to calendar"
              >
                +
              </button>
            )}
          </div>
        </div>

        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-white/10 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} />
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-20 z-[9999] text-xs px-4 py-2 rounded-full bg-slate-900 text-white shadow-lg backdrop-blur-sm">
          {toast}
        </div>
      )}
    </Link>
  );
}
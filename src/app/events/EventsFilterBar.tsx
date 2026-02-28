"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { CampusEvent } from "@/lib/types";
import { useBookmarks } from "@/lib/client";

/* ---------- UTC helpers ---------- */
function inTodayUTC(d: Date, now = new Date()) {
  const y = now.getUTCFullYear(), m = now.getUTCMonth(), da = now.getUTCDate();
  const s = new Date(Date.UTC(y, m, da, 0, 0, 0, 0));
  const e = new Date(Date.UTC(y, m, da, 23, 59, 59, 999));
  return d >= s && d <= e;
}
function inISOWeekUTC(d: Date, now = new Date()) {
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const wd = (base.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  const s = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() - wd, 0, 0, 0, 0));
  const e = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate() + 6, 23, 59, 59, 999));
  return d >= s && d <= e;
}

export type FilterState = {
  q: string;
  range: "today" | "week" | "month" | "all";
  cats: string[];
  when: "upcoming" | "past" | "all";
  onlySaved: boolean;
};

type Props = { data: CampusEvent[]; onChange: (list: CampusEvent[], state: FilterState) => void };

const QUICK_SUGGESTIONS = [
  { label: "Today", icon: "📅", action: "today" },
  { label: "Free food", icon: "🍕", action: "search" },
  { label: "Near me", icon: "📍", action: "location" },
  { label: "Workshops", icon: "🔧", action: "category" },
];

export default function EventsFilterBar({ data, onChange }: Props) {
  const [q, setQ] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<FilterState["range"]>("all");
  const [cats, setCats] = useState<string[]>([]);
  const [when, setWhen] = useState<FilterState["when"]>("all");
  const [onlySaved, setOnlySaved] = useState(false);

  const { map, ids, mounted } = useBookmarks();

  useEffect(() => {
    if (onlySaved && mounted && ids.length === 0) setOnlySaved(false);
  }, [onlySaved, mounted, ids.length]);

  const allCats = useMemo(() => Array.from(new Set(data.map((e) => e.category))).sort(), [data]);

  const savedInListCount = useMemo(() => {
    if (!mounted) return 0;
    const idSet = new Set(ids);
    let count = 0;
    for (const e of data) if (idSet.has(e.id)) count++;
    return count;
  }, [mounted, data, ids]);

  const searchSuggestions = useMemo(() => {
    if (!q.trim() || q.length < 2) return [];
    const query = q.toLowerCase();
    const suggestions = new Set<string>();

    data.forEach((event) => {
      if (event.title.toLowerCase().includes(query)) suggestions.add(event.title);

      const venueStr =
        event.venue.building +
        (event.venue.level ? " " + event.venue.level : "") +
        (event.venue.room ? " " + event.venue.room : "");

      if (venueStr.toLowerCase().includes(query)) suggestions.add(venueStr);
      if (event.category.toLowerCase().includes(query)) suggestions.add(event.category);
    });

    return Array.from(suggestions).slice(0, 5);
  }, [q, data]);

  useEffect(() => {
    const now = new Date();
    let list = data;

    if (onlySaved && mounted) list = list.filter((e) => map.has(e.id));

    if (range !== "all") {
      list = list.filter((e) => {
        const d = new Date(e.date);
        if (range === "today") return inTodayUTC(d, now);
        if (range === "week") return inISOWeekUTC(d, now);
        if (range === "month") return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
        return true;
      });
    }

    if (when !== "all") {
      list = list.filter((e) => (when === "upcoming" ? new Date(e.date) >= now : new Date(e.date) < now));
    }

    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter((e) =>
        (e.title +
          " " +
          (e.description ?? "") +
          " " +
          e.venue.building +
          (e.venue.level ? " " + e.venue.level : "") +
          (e.venue.room ? " " + e.venue.room : "")
        )
          .toLowerCase()
          .includes(t)
      );
    }

    if (cats.length) list = list.filter((e) => cats.includes(e.category));

    list = list.slice().sort((a, b) => +new Date(a.date) - +new Date(b.date));

    onChange(list, { q, range, cats, when, onlySaved });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, range, cats, when, onlySaved, data, map, ids, mounted]);

  const chips: string[] = [];
  if (onlySaved) chips.push("Saved");
  if (range !== "all") chips.push(range === "week" ? "This week" : range === "month" ? "This month" : "Today");
  chips.push(...cats);

  const portalReady = typeof document !== "undefined";

  const handleSuggestionClick = (suggestion: string) => {
    setQ(suggestion);
    setShowSuggestions(false);
    searchRef.current?.blur();
  };

  const handleQuickSuggestion = (action: string) => {
    switch (action) {
      case "today":
        setRange("today");
        setQ("");
        break;
      case "search":
        setQ("free food");
        break;
      case "location":
        break;
      case "category":
        setCats(["Workshop"]);
        break;
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/30 dark:border-slate-700/30 shadow-sm">
      <div className="maxw container-px py-4 space-y-4">
        <div className="relative">
          <div className="relative">
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search events, venues, categories..."
              className="w-full h-12 pl-4 pr-12 rounded-2xl border border-slate-200/60 dark:border-slate-600/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-base dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md placeholder-slate-500 dark:placeholder-slate-400"
              type="search"
              aria-label="Search events"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              )}
              <div className="w-5 h-5 text-slate-400">🔍</div>
            </div>
          </div>

          {showSuggestions && (searchSuggestions.length > 0 || q.length < 2) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-xl z-50 overflow-hidden">
              {q.length < 2 ? (
                <div className="p-4">
                  <div className="text-sm font-medium text-slate-700 mb-3">Quick suggestions</div>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_SUGGESTIONS.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickSuggestion(suggestion.action)}
                        className="flex items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className="text-lg">{suggestion.icon}</span>
                        <span className="text-sm font-medium text-slate-700">{suggestion.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  {searchSuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors text-sm"
                    >
                      <span className="font-medium">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setOnlySaved(!onlySaved)}
            disabled={!mounted || savedInListCount === 0}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              onlySaved
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                : mounted && savedInListCount > 0
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                : "bg-slate-50 text-slate-400 border border-slate-100 opacity-50"
            }`}
            title={onlySaved ? "Show all events" : mounted ? `Show ${savedInListCount} saved event${savedInListCount !== 1 ? "s" : ""}` : "No saved events"}
          >
            ⭐ Saved{mounted && savedInListCount > 0 ? ` (${savedInListCount})` : ""}
          </button>

          {(["today", "week", "month"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(range === r ? "all" : r)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                range === r ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {r === "week" ? "This week" : r === "month" ? "This month" : "Today"}
            </button>
          ))}

          {allCats.slice(0, 3).map((category) => {
            const isSelected = cats.includes(category);
            return (
              <button
                key={category}
                onClick={() => setCats((prev) => (isSelected ? prev.filter((c) => c !== category) : [...prev, category]))}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isSelected ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                {category}
              </button>
            );
          })}

          <button
            onClick={() => setOpen(true)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all duration-200"
            aria-haspopup="dialog"
          >
            More filters
          </button>
        </div>

        {chips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Active filters:</span>
            {chips.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                {c}
                <button
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  onClick={() => {
                    if (c === "Saved") setOnlySaved(false);
                    else if (c === "Today" || c === "This week" || c === "This month") setRange("all");
                    else setCats((prev) => prev.filter((x) => x !== c));
                  }}
                  aria-label={`Remove ${c}`}
                >
                  ✕
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                setQ("");
                setRange("all");
                setCats([]);
                setWhen("all");
                setOnlySaved(false);
              }}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {portalReady &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[1000]">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-900">Filters</h3>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <section>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Date range</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(["today", "week", "month", "all"] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRange(r)}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            range === r ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {r === "all" ? "All dates" : r === "week" ? "This week" : r === "month" ? "This month" : "Today"}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <p className="text-sm font-semibold text-slate-700 mb-3">When</p>
                    <div className="flex gap-3">
                      {(["upcoming", "all", "past"] as const).map((w) => (
                        <button
                          key={w}
                          onClick={() => setWhen(w)}
                          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            when === w ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {w[0].toUpperCase() + w.slice(1)}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Categories</p>
                    <div className="grid grid-cols-2 gap-3">
                      {allCats.map((c) => {
                        const isSelected = cats.includes(c);
                        return (
                          <button
                            key={c}
                            onClick={() => setCats((prev) => (isSelected ? prev.filter((x) => x !== c) : [...prev, c]))}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                              isSelected ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <button
                    onClick={() => setOpen(false)}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
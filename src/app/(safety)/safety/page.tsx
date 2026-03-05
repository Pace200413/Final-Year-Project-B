"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaBoxOpen,
  FaBusAlt,
  FaClinicMedical,
  FaCloudSunRain,
  FaComments,
  FaFireExtinguisher,
  FaFirstAid,
  FaFlask,
  FaHandsHelping,
  FaInfoCircle,
  FaLaptop,
  FaMapMarkerAlt,
  FaMoon,
  FaPhoneAlt,
  FaShieldAlt,
  FaUserShield,
} from "react-icons/fa";
import { Search, X } from "lucide-react";
import {
  EmergencyStrip,
  Eyebrow,
  MiniAction,
  PageTitleBlock,
  SafetyCard,
  SafetyPageShell,
  SectionTitle,
  SmartLink,
  toTelHref,
} from "@/components/safety/SafetyUI";

type SafetySection = {
  id: string;
  group: string;
  title: string;
  text: string;
  link?: string;
  linkLabel?: string;
};

type SafetyData = {
  emergencyNumber: string;
  securityNumber: string;
  itHelpEmail: string;
  reportUrl: string;
  sections: SafetySection[];
};

const FALLBACK: SafetyData = {
  emergencyNumber: "999",
  securityNumber: "082260607",
  itHelpEmail: "helpdesk@swin.edu.my",
  reportUrl: "/support",
  sections: [],
};

function clean(s: string) {
  return (s || "")
    .replace(/â€“/g, "–")
    .replace(/â€”/g, "—")
    .replace(/Â/g, "");
}

const ICONS: Record<string, ReactNode> = {
  "fire-safety": <FaFireExtinguisher className="text-slate-500" />,
  "personal-safety": <FaShieldAlt className="text-slate-500" />,
  medical: <FaFirstAid className="text-slate-500" />,
  labs: <FaFlask className="text-slate-500" />,
  weather: <FaCloudSunRain className="text-slate-500" />,
  "info-counter": <FaInfoCircle className="text-slate-500" />,
  "student-support": <FaHandsHelping className="text-slate-500" />,
  "lost-found": <FaBoxOpen className="text-slate-500" />,
  clinic: <FaClinicMedical className="text-slate-500" />,
  counselling: <FaHandsHelping className="text-slate-500" />,
  shuttle: <FaBusAlt className="text-slate-500" />,
  parking: <FaMapMarkerAlt className="text-slate-500" />,
  escort: <FaMoon className="text-slate-500" />,
};

const TOPIC_ALIASES: Record<string, string> = {
  // direct
  medical: "medical",
  fire: "fire-safety",
  "fire-safety": "fire-safety",
  unsafe: "personal-safety",
  "personal-safety": "personal-safety",
  weather: "weather",
  labs: "labs",
  clinic: "clinic",
  counselling: "counselling",
  "lost-found": "lost-found",
  lost: "lost-found",
  support: "student-support",
};

function TopicChip({
  label,
  icon,
  onClick,
  active,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium ring-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2 ${
        active
          ? "bg-slate-900 text-white ring-slate-900"
          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      <span className="text-[13px]">{icon}</span>
      {label}
    </button>
  );
}

export default function SafetyPage() {
  const searchParams = useSearchParams();
  const topicParam = (searchParams.get("topic") || "").trim().toLowerCase();

  const [data, setData] = useState<SafetyData>(FALLBACK);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // ✅ fetch once
  useEffect(() => {
    let alive = true;

    fetch("/api/safety", { cache: "no-store" })
      .then((r) => r.json())
      .then((json: SafetyData) => {
        if (!alive) return;

        const sections = Array.isArray(json.sections)
          ? json.sections.map((s) => ({
              ...s,
              title: clean(s.title),
              text: clean(s.text),
              linkLabel: clean(s.linkLabel || ""),
              group: clean(s.group || "General"),
            }))
          : [];

        setData({
          emergencyNumber: json.emergencyNumber || FALLBACK.emergencyNumber,
          securityNumber: json.securityNumber || FALLBACK.securityNumber,
          itHelpEmail: json.itHelpEmail || FALLBACK.itHelpEmail,
          reportUrl: json.reportUrl || FALLBACK.reportUrl,
          sections,
        });

        // default open
        setOpenId((prev) => prev ?? (sections[0]?.id ?? null));
      })
      .catch(() => {
        if (!alive) return;
        setData(FALLBACK);
      });

    return () => {
      alive = false;
    };
  }, []);

  // ✅ deep-link support: /safety?topic=medical etc.
  useEffect(() => {
    if (!topicParam) return;
    if (!data.sections?.length) return;

    const desired = TOPIC_ALIASES[topicParam] ?? topicParam;
    const exists = data.sections.some((s) => s.id === desired);

    if (!exists) return;

    setOpenId(desired);

    // gentle scroll into view (mobile-friendly)
    setTimeout(() => {
      const el = document.getElementById(`topic-${desired}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, [topicParam, data.sections]);

  const q = query.trim().toLowerCase();

  const groupedSections = useMemo(() => {
    const map = new Map<string, SafetySection[]>();

    const matches = (s: SafetySection) => {
      if (!q) return true;
      const hay = `${s.group} ${s.title} ${s.text} ${s.linkLabel ?? ""}`.toLowerCase();
      return hay.includes(q);
    };

    for (const section of data.sections ?? []) {
      if (!matches(section)) continue;

      const group = section.group?.trim() || "General";
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(section);
    }

    // stable ordering
    const entries = Array.from(map.entries()).map(([group, sections]) => [
      group,
      sections.slice().sort((a, b) => a.title.localeCompare(b.title)),
    ]) as Array<[string, SafetySection[]]>;

    // keep "General" first, others alphabetical
    entries.sort((a, b) => {
      if (a[0] === "General") return -1;
      if (b[0] === "General") return 1;
      return a[0].localeCompare(b[0]);
    });

    return entries;
  }, [data.sections, q]);

  // ✅ if filtering hides the open section, open the first visible one
  useEffect(() => {
    if (!q) return;
    const flat = groupedSections.flatMap(([, secs]) => secs);
    if (!flat.length) return;

    const stillVisible = openId && flat.some((s) => s.id === openId);
    if (!stillVisible) setOpenId(flat[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, groupedSections]);

  const openTopic = (id: string) => {
    setOpenId(id);
    setTimeout(() => {
      document.getElementById(`topic-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <SafetyPageShell
      strip={
        <EmergencyStrip
          ariaLabel="Safety quick actions"
          items={[
            {
              label: "Call Security",
              href: toTelHref(data.securityNumber),
              icon: <FaPhoneAlt />,
              tone: "red",
              ariaLabel: "Call campus security",
            },
            {
              label: "Call 999",
              href: toTelHref(data.emergencyNumber),
              icon: <FaShieldAlt />,
              tone: "dark",
              ariaLabel: "Call emergency services",
            },
            {
              label: "Find Exit",
              href: "/exit-navigation",
              icon: <FaMapMarkerAlt />,
              tone: "light",
              ariaLabel: "Open exit navigation",
            },
          ]}
        />
      }
    >
      <SafetyCard>
        <PageTitleBlock
          eyebrow={<Eyebrow>Safety Guidance</Eyebrow>}
          title="What to do — step by step"
          description="Use this page for quick guidance in common situations (fire, medical, personal safety, weather, labs) and links to the right help."
        >
          <div className="grid grid-cols-3 gap-2">
            <MiniAction href={toTelHref(data.securityNumber)} icon={<FaPhoneAlt />} label="Call" />
            <MiniAction href={`mailto:${data.itHelpEmail}`} icon={<FaLaptop />} label="IT Help" />
            <MiniAction href={data.reportUrl} icon={<FaComments />} label="Get Help" />
          </div>

          {/* Search */}
          <div className="mt-4">
            <label className="text-sm font-semibold text-slate-900">Search guidance</label>
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                placeholder="Try: fire, injury, clinic, lost, weather..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Quick chooser */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">What’s happening?</p>
              <SmartLink
                href="/emergency"
                className="text-xs font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-400"
              >
                Back to hub
              </SmartLink>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <TopicChip
                label="Unsafe"
                icon={<FaUserShield />}
                onClick={() => openTopic("personal-safety")}
                active={openId === "personal-safety"}
              />
              <TopicChip
                label="Medical"
                icon={<FaFirstAid />}
                onClick={() => openTopic("medical")}
                active={openId === "medical"}
              />
              <TopicChip
                label="Fire"
                icon={<FaFireExtinguisher />}
                onClick={() => openTopic("fire-safety")}
                active={openId === "fire-safety"}
              />
              <TopicChip
                label="Weather"
                icon={<FaCloudSunRain />}
                onClick={() => openTopic("weather")}
                active={openId === "weather"}
              />
              <TopicChip
                label="Lost & Found"
                icon={<FaBoxOpen />}
                onClick={() => openTopic("lost-found")}
                active={openId === "lost-found"}
              />
              <TopicChip
                label="Clinic"
                icon={<FaClinicMedical />}
                onClick={() => openTopic("clinic")}
                active={openId === "clinic"}
              />
            </div>
          </div>
        </PageTitleBlock>
      </SafetyCard>

      <div className="mt-5 space-y-5">
        {groupedSections.length === 0 ? (
          <SafetyCard>
            <SectionTitle title="No results" subtitle="Try a different search term." />
          </SafetyCard>
        ) : null}

        {groupedSections.map(([group, sections]) => (
          <SafetyCard key={group} className="overflow-hidden p-0">
            <div className="border-b border-slate-100 px-5 py-4">
              <SectionTitle title={group} subtitle="Tap a topic to view guidance and related links." />
            </div>

            <div className="divide-y divide-slate-100">
              {sections.map((s) => {
                const isOpen = openId === s.id;
                const panelId = `panel-${s.id}`;

                return (
                  <div key={s.id} id={`topic-${s.id}`}>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : s.id)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-start gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
                    >
                      <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-lg">
                        {ICONS[s.id] ?? <FaInfoCircle className="text-slate-500" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900">{s.title}</h3>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {isOpen ? s.text : "Tap to read guidance"}
                            </p>
                          </div>

                          <span
                            className={`mt-1 shrink-0 text-slate-400 transition ${isOpen ? "rotate-90" : ""}`}
                            aria-hidden="true"
                          >
                            ›
                          </span>
                        </div>
                      </div>
                    </button>

                    {isOpen ? (
                      <div id={panelId} className="px-5 pb-5">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm leading-6 text-slate-700">{s.text}</p>

                          {s.link ? (
                            <div className="mt-4">
                              <SmartLink
                                href={s.link}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
                              >
                                {s.linkLabel || "Learn more"}
                              </SmartLink>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </SafetyCard>
        ))}
      </div>

      <SafetyCard className="mt-5 text-center">
        <FaComments className="mx-auto mb-3 text-xl text-slate-500" />
        <h2 className="text-base font-semibold text-slate-900">Need more help?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          For non-urgent help, reporting, FAQs, and service contacts, open Support.
        </p>

        <SmartLink
          href={data.reportUrl}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#E31B23] px-4 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
        >
          Open Support / Report
        </SmartLink>
      </SafetyCard>
    </SafetyPageShell>
  );
}
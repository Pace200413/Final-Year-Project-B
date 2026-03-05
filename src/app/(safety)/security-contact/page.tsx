"use client";

import { useEffect, useRef, useState } from "react";
import { FaDoorOpen, FaMapMarkedAlt, FaPhoneAlt, FaShieldAlt } from "react-icons/fa";
import { MdEmergency } from "react-icons/md";
import {
  ActionLinkCard,
  EmergencyStrip,
  Eyebrow,
  InlineAlert,
  NumberStep,
  PageTitleBlock,
  SafetyCard,
  SafetyPageShell,
  SectionTitle,
  SmartLink,
  SAFETY_RED,
  toTelHref,
} from "@/components/safety/SafetyUI";

type SecuritySettings = {
  emergencyLabel: string;
  emergencyTel: string; // may be 999 or campus emergency — we will call Security from contacts[0] if available
  exitNavLabel: string;
  exitNavUrl: string;
  title: string;
  subtitle: string;
  alertText: string;
  exitGuide: {
    locationText: string;
    nearestExitText: string;
    linkText: string;
    linkHref: string;
  };
  contacts: { name: string; phone: string }[];
  bottomCards: { title: string; description: string; href: string; linkText?: string }[];
};

const API = "/api/admin/security-settings";

const FALLBACK: SecuritySettings = {
  emergencyLabel: "Emergency",
  emergencyTel: "999",
  exitNavLabel: "Exit Navigation",
  exitNavUrl: "/exit-navigation",
  title: "Emergency Contacts",
  subtitle: "Tap a contact to call. For urgent danger, call Security or 999 first.",
  alertText:
    "If there is immediate danger, injury, smoke, fire, or a serious security concern, call first and move to a safer location.",
  exitGuide: {
    locationText: "Your location will appear here.",
    nearestExitText: "Nearest exit will be suggested automatically.",
    linkText: "Find Exit",
    linkHref: "/exit-navigation",
  },
  contacts: [
    { name: "Campus Security", phone: "082-260-607" },
    { name: "Emergency Services", phone: "999" },
    { name: "Health Clinic", phone: "082-260-620" },
  ],
  bottomCards: [
    {
      title: "What to do",
      description: "Step-by-step guidance for fire, medical, weather, personal safety, and more.",
      href: "/safety",
      linkText: "Open safety guidance",
    },
    {
      title: "Get Help / Report",
      description: "Non-urgent support, reporting, service contacts, and FAQs.",
      href: "/support",
      linkText: "Open support",
    },
  ],
};

export default function SecurityContactPage() {
  const [s, setS] = useState<SecuritySettings>(FALLBACK);
  const [err, setErr] = useState<string | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const load = async () => {
    try {
      const r = await fetch(API, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setS({ ...FALLBACK, ...(j.settings ?? j) });
      setErr(null);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
      setS(FALLBACK);
    }
  };

  useEffect(() => {
    load();

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("security-settings");
      bcRef.current.onmessage = (msg) => {
        if (msg?.data?.type === "updated") load();
      };
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "security-settings:updated") load();
    };

    window.addEventListener("storage", onStorage);

    return () => {
      try {
        bcRef.current?.close();
      } catch {}
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const securityPhone = s.contacts?.[0]?.phone || s.emergencyTel;

  return (
    <SafetyPageShell
      strip={
        <EmergencyStrip
          ariaLabel="Emergency quick actions"
          items={[
            {
              label: "Call Security",
              href: toTelHref(securityPhone),
              icon: <FaPhoneAlt />,
              tone: "red",
              ariaLabel: "Call campus security",
            },
            {
              label: "Call 999",
              href: "tel:999",
              icon: <FaShieldAlt />,
              tone: "dark",
              ariaLabel: "Call emergency services 999",
            },
            {
              label: "Find Exit",
              href: s.exitNavUrl,
              icon: <FaDoorOpen />,
              tone: "light",
              ariaLabel: "Open exit navigation",
            },
          ]}
        />
      }
    >
      <SafetyCard>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <PageTitleBlock eyebrow={<Eyebrow>Safety Hub</Eyebrow>} title={s.title} description={s.subtitle} />
          </div>

          <SmartLink
            href="/emergency"
            className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
          >
            Back to hub
          </SmartLink>
        </div>

        <div className="mt-4">
          <InlineAlert tone="red">{s.alertText}</InlineAlert>

          {err ? (
            <div className="mt-3">
              <InlineAlert tone="amber">Using fallback contact details because settings could not be loaded.</InlineAlert>
            </div>
          ) : null}
        </div>
      </SafetyCard>

      <SafetyCard className="mt-5 overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <SectionTitle title="In an emergency" subtitle="Do these 3 steps first." />
        </div>

        <div className="divide-y divide-slate-100">
          <NumberStep number="1" title="Call first" text="Call Campus Security or 999 immediately if the situation is urgent." />
          <NumberStep number="2" title="Move to safety" text="Leave the area if needed and use Find Exit to evacuate quickly." />
          <NumberStep number="3" title="Follow instructions" text="Follow directions from campus staff, security, or emergency responders." />
        </div>
      </SafetyCard>

      <SafetyCard className="mt-5">
        <SectionTitle title="Find Exit" subtitle="Use during evacuation if it’s safe to move." />
        <div className="mt-3 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            <span className="font-medium text-slate-900">Your location:</span> {s.exitGuide.locationText}
          </p>
          <p className="mt-2 text-sm text-slate-700">
            <span className="font-medium text-slate-900">Nearest exit:</span> {s.exitGuide.nearestExitText}
          </p>

          <a
            href={s.exitGuide.linkHref}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
          >
            {s.exitGuide.linkText}
          </a>
        </div>
      </SafetyCard>

      <SafetyCard className="mt-5 overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <SectionTitle title="Contacts" subtitle="Tap a contact to call directly from mobile." />
        </div>

        <div className="divide-y divide-slate-100">
          {s.contacts.map((c, i) => {
            const isPrimary = i === 0;

            return (
              <div key={`${c.name}-${i}`} className="flex items-center gap-3 px-5 py-4">
                <div
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: isPrimary ? "rgba(227,27,35,0.10)" : "#F8FAFC",
                    color: isPrimary ? SAFETY_RED : "#334155",
                  }}
                >
                  <MdEmergency />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">{c.name}</h3>
                  <p className="mt-0.5 text-sm text-slate-600">{c.phone}</p>
                </div>

                <a
                  href={toTelHref(c.phone)}
                  className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
                  style={{ backgroundColor: isPrimary ? SAFETY_RED : "#0F172A" }}
                  aria-label={`Call ${c.name}`}
                >
                  Call
                </a>
              </div>
            );
          })}
        </div>
      </SafetyCard>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {s.bottomCards.map((b, idx) => (
          <ActionLinkCard
            key={`${b.title}-${idx}`}
            href={b.href}
            icon={idx === 0 ? <FaShieldAlt /> : <FaMapMarkedAlt />}
            title={b.title}
            description={b.description}
          />
        ))}
      </div>
    </SafetyPageShell>
  );
}
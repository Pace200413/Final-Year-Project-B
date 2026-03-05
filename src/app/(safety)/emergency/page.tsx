"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  FaComments,
  FaDoorOpen,
  FaExclamationTriangle,
  FaFirstAid,
  FaFireExtinguisher,
  FaPhoneAlt,
  FaShieldAlt,
  FaUserShield,
} from "react-icons/fa";
import {
  ActionLinkCard,
  EmergencyStrip,
  Eyebrow,
  InfoRow,
  InlineAlert,
  PageTitleBlock,
  SAFETY_RED,
  SafetyCard,
  SafetyPageShell,
  SectionTitle,
  SmartLink,
  toTelHref,
} from "@/components/safety/SafetyUI";

type SecuritySettings = {
  emergencyLabel: string; // shown inside the big call card
  emergencyTel: string;   // campus security number
  exitNavLabel: string;
  exitNavUrl: string;
};

const API = "/api/admin/security-settings";

const FALLBACK: SecuritySettings = {
  emergencyLabel: "Campus Security",
  emergencyTel: "082260607",
  exitNavLabel: "Exit Navigation",
  exitNavUrl: "/exit-navigation",
};

function QuickTile({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <SmartLink
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
    >
      <div className="flex items-start gap-3">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-xs leading-5 text-slate-600">{subtitle}</div>
        </div>
      </div>
    </SmartLink>
  );
}

export default function EmergencyPage() {
  const [cfg, setCfg] = useState<SecuritySettings>(FALLBACK);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const load = async () => {
    try {
      const res = await fetch(API, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const s = (json.settings ?? json) as Partial<SecuritySettings>;
      setCfg({ ...FALLBACK, ...s });
    } catch {
      setCfg(FALLBACK);
    }
  };

  useEffect(() => {
    load();

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("security-settings");
      bcRef.current.onmessage = (m) => {
        if (m?.data?.type === "updated") load();
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

  return (
    <SafetyPageShell
      strip={
        <EmergencyStrip
          ariaLabel="Emergency quick actions"
          items={[
            {
              label: "Call Security",
              href: toTelHref(cfg.emergencyTel),
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
              href: cfg.exitNavUrl,
              icon: <FaDoorOpen />,
              tone: "light",
              ariaLabel: "Open exit navigation",
            },
          ]}
        />
      }
    >
      {/* HERO */}
      <SafetyCard>
        <PageTitleBlock
          eyebrow={<Eyebrow>Safety Hub</Eyebrow>}
          title="Get help fast"
          description="If it’s urgent: call security or 999 first. Then use exit navigation if you need to evacuate."
        >
          <div className="grid grid-cols-1 gap-3">
            {/* Big Call Security */}
            <a
              href={toTelHref(cfg.emergencyTel)}
              className="inline-flex items-center justify-between rounded-2xl px-4 py-4 text-white shadow-sm transition active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
              style={{ backgroundColor: SAFETY_RED }}
              aria-label={`Call ${cfg.emergencyLabel || "Campus Security"}`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/15 p-2">
                  <FaPhoneAlt />
                </div>
                <div>
                  <div className="text-sm font-semibold">{cfg.emergencyLabel || "Campus Security"}</div>
                  <div className="text-xs text-red-100">Immediate help on campus</div>
                </div>
              </div>
              <span className="text-sm opacity-80">→</span>
            </a>

            {/* Big Find Exit */}
            <a
              href={cfg.exitNavUrl}
              className="inline-flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-4 text-white shadow-sm transition active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
              aria-label="Open exit navigation"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2">
                  <FaDoorOpen />
                </div>
                <div>
                  <div className="text-sm font-semibold">{cfg.exitNavLabel || "Exit Navigation"}</div>
                  <div className="text-xs text-slate-300">Use during evacuation</div>
                </div>
              </div>
              <span className="text-sm opacity-80">→</span>
            </a>

            {/* Small secondary link */}
            <SmartLink
              href="/security-contact"
              className="text-center text-sm font-semibold text-slate-800 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2 rounded-lg py-2"
            >
              Need more numbers? Open Emergency Contacts
            </SmartLink>
          </div>

          <div className="mt-4">
            <InlineAlert tone="red">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="mt-0.5 shrink-0 text-red-600" />
                <span>
                  If there is immediate danger, injury, smoke, fire, or a serious security concern:
                  <b> call first</b> and move to a safer location.
                </span>
              </div>
            </InlineAlert>
          </div>
        </PageTitleBlock>
      </SafetyCard>

      {/* WHAT'S HAPPENING (mobile clarity win) */}
      <div className="mt-5">
        <SectionTitle
          title="What’s happening?"
          subtitle="Pick the closest situation. We’ll take you to the right place."
        />

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickTile
            href="/security-contact"
            icon={<FaUserShield />}
            title="I feel unsafe"
            subtitle="Suspicious person, harassment, threats, after-hours concerns."
          />
          <QuickTile
            href="/safety"
            icon={<FaFirstAid />}
            title="Medical / injury"
            subtitle="First aid guidance and what to do before help arrives."
          />
          <QuickTile
            href="/safety"
            icon={<FaFireExtinguisher />}
            title="Fire / smoke"
            subtitle="Evacuate safely, use exits, and follow fire guidance."
          />
          <QuickTile
            href="/support"
            icon={<FaComments />}
            title="Non-urgent help / report"
            subtitle="Report issues, request help, browse FAQs and services."
          />
        </div>
      </div>

      {/* MORE NAV (kept but renamed + de-duplicated) */}
      <div className="mt-5">
        <SectionTitle title="More help & info" subtitle="Other useful pages in the Safety Hub." />

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ActionLinkCard
            href="/security-contact"
            icon={<FaShieldAlt />}
            title="Emergency Contacts"
            description="More campus and public emergency numbers in one place."
          />
          <ActionLinkCard
            href="/safety"
            icon={<FaFireExtinguisher />}
            title="What to do"
            description="Fire, medical, weather, labs, personal safety, and more."
          />
          <ActionLinkCard
            href="/support"
            icon={<FaComments />}
            title="Get Help / Report"
            description="Non-urgent support, reporting, and FAQs."
          />
          <ActionLinkCard
            href={cfg.exitNavUrl}
            icon={<FaDoorOpen />}
            title="Find Exit"
            description="Open the nearest safe exit route from your location."
          />
        </div>
      </div>

      {/* SIMPLE EXPLANATION */}
      <SafetyCard className="mt-5 overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <SectionTitle title="How to use this hub" subtitle="Simple order: action first, information second." />
        </div>

        <div className="divide-y divide-slate-100">
          <InfoRow
            title="1) Call first"
            text="For urgent situations, call Campus Security or 999 immediately."
          />
          <InfoRow
            title="2) Exit if needed"
            text="If the area is unsafe, use Find Exit to evacuate quickly."
          />
          <InfoRow
            title="3) Get help / report"
            text="For non-urgent issues, use Get Help / Report to contact services or submit requests."
          />
        </div>
      </SafetyCard>
    </SafetyPageShell>
  );
}
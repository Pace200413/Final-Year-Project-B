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
import {
  DEFAULT_EMERGENCY_CONTENT,
  type EmergencyContent,
  type EmergencyMoreHelpCard,
  type EmergencyQuickTile,
} from "@/lib/emergency";

const API = "/api/emergency";

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

function quickTileIcon(icon: EmergencyQuickTile["icon"]) {
  switch (icon) {
    case "userShield":
      return <FaUserShield />;
    case "firstAid":
      return <FaFirstAid />;
    case "fireExtinguisher":
      return <FaFireExtinguisher />;
    case "comments":
    default:
      return <FaComments />;
  }
}

function moreHelpIcon(icon: EmergencyMoreHelpCard["icon"]) {
  switch (icon) {
    case "shield":
      return <FaShieldAlt />;
    case "fireExtinguisher":
      return <FaFireExtinguisher />;
    case "door":
      return <FaDoorOpen />;
    case "comments":
    default:
      return <FaComments />;
  }
}

export default function EmergencyPage() {
  const [content, setContent] = useState<EmergencyContent>(DEFAULT_EMERGENCY_CONTENT);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const load = async () => {
    try {
      const res = await fetch(API, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setContent(json.content ?? DEFAULT_EMERGENCY_CONTENT);
    } catch {
      setContent(DEFAULT_EMERGENCY_CONTENT);
    }
  };

  useEffect(() => {
    load();

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("emergency-content");
      bcRef.current.onmessage = (m) => {
        if (m?.data?.type === "updated") load();
      };
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "emergency:updated") load();
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
              label: content.stripCallSecurityLabel,
              href: toTelHref(content.emergencyTel),
              icon: <FaPhoneAlt />,
              tone: "red",
              ariaLabel: `Call ${content.emergencyLabel}`,
            },
            {
              label: content.stripCall999Label,
              href: "tel:999",
              icon: <FaShieldAlt />,
              tone: "dark",
              ariaLabel: "Call emergency services 999",
            },
            {
              label: content.stripFindExitLabel,
              href: content.exitNavUrl,
              icon: <FaDoorOpen />,
              tone: "light",
              ariaLabel: "Open exit navigation",
            },
          ]}
        />
      }
    >
      <SafetyCard>
        <PageTitleBlock
          eyebrow={<Eyebrow>{content.eyebrow}</Eyebrow>}
          title={content.heroTitle}
          description={content.heroDescription}
        >
          <div className="grid grid-cols-1 gap-3">
            <a
              href={toTelHref(content.emergencyTel)}
              className="inline-flex items-center justify-between rounded-2xl px-4 py-4 text-white shadow-sm transition active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
              style={{ backgroundColor: SAFETY_RED }}
              aria-label={`Call ${content.emergencyLabel}`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/15 p-2">
                  <FaPhoneAlt />
                </div>
                <div>
                  <div className="text-sm font-semibold">{content.emergencyLabel}</div>
                  <div className="text-xs text-red-100">{content.emergencySubtitle}</div>
                </div>
              </div>
              <span className="text-sm opacity-80">→</span>
            </a>

            <a
              href={content.exitNavUrl}
              className="inline-flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-4 text-white shadow-sm transition active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
              aria-label="Open exit navigation"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2">
                  <FaDoorOpen />
                </div>
                <div>
                  <div className="text-sm font-semibold">{content.exitNavLabel}</div>
                  <div className="text-xs text-slate-300">{content.exitNavSubtitle}</div>
                </div>
              </div>
              <span className="text-sm opacity-80">→</span>
            </a>

            <SmartLink
              href={content.secondaryLinkHref}
              className="rounded-lg py-2 text-center text-sm font-semibold text-slate-800 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
            >
              {content.secondaryLinkLabel}
            </SmartLink>
          </div>

          <div className="mt-4">
            <InlineAlert tone="red">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="mt-0.5 shrink-0 text-red-600" />
                <span>{content.alertText}</span>
              </div>
            </InlineAlert>
          </div>
        </PageTitleBlock>
      </SafetyCard>

      <div className="mt-5">
        <SectionTitle
          title={content.quickSectionTitle}
          subtitle={content.quickSectionSubtitle}
        />

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {content.quickTiles.map((item, idx) => (
            <QuickTile
              key={`${item.title}-${idx}`}
              href={item.href}
              icon={quickTileIcon(item.icon)}
              title={item.title}
              subtitle={item.subtitle}
            />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <SectionTitle
          title={content.moreHelpTitle}
          subtitle={content.moreHelpSubtitle}
        />

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {content.moreHelpCards.map((item, idx) => (
            <ActionLinkCard
              key={`${item.title}-${idx}`}
              href={item.href}
              icon={moreHelpIcon(item.icon)}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>

      <SafetyCard className="mt-5 overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <SectionTitle
            title={content.howToTitle}
            subtitle={content.howToSubtitle}
          />
        </div>

        <div className="divide-y divide-slate-100">
          {content.howToSteps.map((step, idx) => (
            <InfoRow
              key={`${step.title}-${idx}`}
              title={step.title}
              text={step.text}
            />
          ))}
        </div>
      </SafetyCard>
    </SafetyPageShell>
  );
}
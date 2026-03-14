"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaComments,
  FaEnvelope,
  FaExclamationTriangle,
  FaPhoneAlt,
  FaShieldAlt,
} from "react-icons/fa";
import {
  EmergencyStrip,
  Eyebrow,
  InfoRow,
  InlineAlert,
  MiniAction,
  PageTitleBlock,
  SafetyCard,
  SafetyPageShell,
  SectionTitle,
  SmartLink,
  toTelHref,
} from "@/components/safety/SafetyUI";
import {
  DEFAULT_SAFETY_CONTENT,
  type SafetyContent,
  type SafetyContentSection,
} from "@/lib/safety";

const API = "/api/safety";

function groupSections(items: SafetyContentSection[]) {
  return items.reduce<Record<string, SafetyContentSection[]>>((acc, item) => {
    const key = item.group?.trim() || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export default function SafetyPage() {
  const [content, setContent] = useState<SafetyContent>(DEFAULT_SAFETY_CONTENT);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const load = async () => {
    try {
      const res = await fetch(API, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setContent(json.content ?? DEFAULT_SAFETY_CONTENT);
    } catch {
      setContent(DEFAULT_SAFETY_CONTENT);
    }
  };

  useEffect(() => {
    load();

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("safety-content");
      bcRef.current.onmessage = (m) => {
        if (m?.data?.type === "updated") load();
      };
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "safety:updated") load();
    };

    window.addEventListener("storage", onStorage);

    return () => {
      try {
        bcRef.current?.close();
      } catch {}
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const grouped = useMemo(() => groupSections(content.sections), [content.sections]);

  return (
    <SafetyPageShell
      strip={
        <EmergencyStrip
          ariaLabel="Safety quick actions"
          items={[
            {
              label: content.stripEmergencyLabel,
              href: toTelHref(content.emergencyNumber),
              icon: <FaPhoneAlt />,
              tone: "red",
              ariaLabel: `Call ${content.emergencyNumber}`,
            },
            {
              label: content.stripSecurityLabel,
              href: toTelHref(content.securityNumber),
              icon: <FaShieldAlt />,
              tone: "dark",
              ariaLabel: "Call campus security",
            },
            {
              label: content.stripReportLabel,
              href: content.reportUrl,
              icon: <FaComments />,
              tone: "light",
              ariaLabel: content.reportLabel,
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniAction
              href={toTelHref(content.emergencyNumber)}
              icon={<FaPhoneAlt />}
              label={content.stripEmergencyLabel}
            />
            <MiniAction
              href={toTelHref(content.securityNumber)}
              icon={<FaShieldAlt />}
              label={content.stripSecurityLabel}
            />
            <MiniAction
              href={content.reportUrl}
              icon={<FaComments />}
              label={content.reportLabel}
            />
            <MiniAction
              href={`mailto:${content.itHelpEmail}`}
              icon={<FaEnvelope />}
              label={content.itHelpLabel}
            />
          </div>

          <div className="mt-4">
            <InlineAlert tone="red">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="mt-0.5 shrink-0 text-red-600" />
                <span>{content.quickNote}</span>
              </div>
            </InlineAlert>
          </div>
        </PageTitleBlock>
      </SafetyCard>

      <div className="mt-5">
        <SectionTitle
          title={content.sectionsTitle}
          subtitle={content.sectionsSubtitle}
        />
      </div>

      <div className="mt-4 grid gap-4">
        {Object.entries(grouped).map(([group, items]) => (
          <SafetyCard key={group} className="overflow-hidden p-0">
            <div className="border-b border-slate-100 px-5 py-4">
              <SectionTitle title={group} />
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <InfoRow
                  key={item.id}
                  title={item.title}
                  text={item.text}
                  right={
                    item.link ? (
                      <SmartLink
                        href={item.link}
                        className="inline-flex items-center rounded-xl bg-slate-50 px-3.5 py-2 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
                      >
                        {item.linkLabel || "Open"}
                      </SmartLink>
                    ) : null
                  }
                />
              ))}
            </div>
          </SafetyCard>
        ))}
      </div>

      <SafetyCard className="mt-5">
        <SectionTitle
          title={content.feedbackHeading}
          subtitle={content.feedbackDescription}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <SmartLink
            href={content.feedbackButtonHref}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm"
          >
            {content.feedbackButtonText}
          </SmartLink>

          <SmartLink
            href={`mailto:${content.itHelpEmail}`}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm"
          >
            {content.itHelpLabel}
          </SmartLink>
        </div>
      </SafetyCard>
    </SafetyPageShell>
  );
}
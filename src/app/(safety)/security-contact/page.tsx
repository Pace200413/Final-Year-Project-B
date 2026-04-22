"use client";

import { useEffect, useState } from "react";
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
import {
  cloneCmsContent,
  getCmsPageConfig,
  type SecurityContactContent,
} from "@/lib/page-cms";

const API = "/api/cms/security-contact";

const DEFAULT_CONTENT = cloneCmsContent(
  getCmsPageConfig("security-contact")!.defaultContent
) as SecurityContactContent;

export default function SecurityContactPage() {
  const [content, setContent] = useState<SecurityContactContent>(DEFAULT_CONTENT);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const r = await fetch(API, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();

        if (!alive) return;

        setContent(j.content ?? DEFAULT_CONTENT);
        setErr(null);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? String(e));
        setContent(DEFAULT_CONTENT);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const primaryPhone =
    content.contacts.find((c) => c.isPrimary)?.phone ||
    content.contacts[0]?.phone ||
    "999";

  return (
    <SafetyPageShell
      strip={
        <EmergencyStrip
          ariaLabel="Emergency quick actions"
          items={[
            {
              label: content.stripCallSecurityLabel,
              href: toTelHref(primaryPhone),
              icon: <FaPhoneAlt />,
              tone: "red",
              ariaLabel: "Call campus security",
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
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <PageTitleBlock
              eyebrow={<Eyebrow>{content.eyebrow}</Eyebrow>}
              title={content.title}
              description={content.subtitle}
            />
          </div>

          <SmartLink
            href={content.backToHubHref}
            className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
          >
            {content.backToHubLabel}
          </SmartLink>
        </div>

        <div className="mt-4">
          <InlineAlert tone="red">{content.alertText}</InlineAlert>

          {err ? (
            <div className="mt-3">
              <InlineAlert tone="amber">
                Using fallback contact details because settings could not be loaded.
              </InlineAlert>
            </div>
          ) : null}
        </div>
      </SafetyCard>

      <SafetyCard className="mt-5 overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <SectionTitle title={content.stepsTitle} subtitle={content.stepsSubtitle} />
        </div>

        <div className="divide-y divide-slate-100">
          {content.steps.map((step, idx) => (
            <NumberStep
              key={`${step.title}-${idx}`}
              number={step.number}
              title={step.title}
              text={step.text}
            />
          ))}
        </div>
      </SafetyCard>

      <SafetyCard className="mt-5">
        <SectionTitle title={content.exitTitle} subtitle={content.exitSubtitle} />
        <div className="mt-3 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            <span className="font-medium text-slate-900">Your location:</span>{" "}
            {content.exitLocationText}
          </p>
          <p className="mt-2 text-sm text-slate-700">
            <span className="font-medium text-slate-900">Nearest exit:</span>{" "}
            {content.exitNearestText}
          </p>

          <SmartLink
            href={content.exitLinkHref}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
          >
            {content.exitLinkText}
          </SmartLink>
        </div>
      </SafetyCard>

      <SafetyCard className="mt-5 overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <SectionTitle title={content.contactsTitle} subtitle={content.contactsSubtitle} />
        </div>

        <div className="divide-y divide-slate-100">
          {content.contacts.map((c, i) => {
            const isPrimary = !!c.isPrimary;

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
        {content.bottomCards.map((card, idx) => (
          <ActionLinkCard
            key={`${card.title}-${idx}`}
            href={card.href}
            icon={idx === 0 ? <FaShieldAlt /> : <FaMapMarkedAlt />}
            title={card.title}
            description={card.description}
          />
        ))}
      </div>
    </SafetyPageShell>
  );
}
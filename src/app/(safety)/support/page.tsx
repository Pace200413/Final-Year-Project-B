"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone, X } from "lucide-react";
import { FaDoorOpen, FaPhoneAlt, FaShieldAlt } from "react-icons/fa";
import { EmergencyBanner, EmergencyFAB } from "@/components/SystemLayer";
import { SupportDirectory, SupportRequestForm } from "@/components/SupportUI";
import type { Service } from "@/components/appTypes";
import {
  EmergencyStrip,
  Eyebrow,
  InlineAlert,
  PageTitleBlock,
  SafetyCard,
  SafetyPageShell,
  SmartLink,
  toTelHref,
} from "@/components/safety/SafetyUI";
import {
  DEFAULT_SUPPORT_PAGE_CONTENT,
  type SupportPageContent,
} from "@/lib/support-page";

const API = "/api/support-page";

export default function SupportPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [content, setContent] = useState<SupportPageContent>(DEFAULT_SUPPORT_PAGE_CONTENT);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const load = async () => {
    try {
      const r = await fetch(API, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json();
      setContent(json.content ?? DEFAULT_SUPPORT_PAGE_CONTENT);
    } catch {
      setContent(DEFAULT_SUPPORT_PAGE_CONTENT);
    }
  };

  useEffect(() => {
    load();

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("support-page-content");
      bcRef.current.onmessage = (msg) => {
        if (msg?.data?.type === "updated") load();
      };
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "support-page:updated") load();
    };

    window.addEventListener("storage", onStorage);

    return () => {
      try {
        bcRef.current?.close();
      } catch {}
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const jumpToServices = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      document.getElementById("services")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  };

  return (
    <SafetyPageShell
      strip={
        <EmergencyStrip
          ariaLabel="Emergency quick actions"
          items={[
            {
              label: content.stripCallSecurityLabel,
              href: toTelHref(content.alertPhone),
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
              description={content.description}
            />
          </div>

          <SmartLink
            href={content.backToHubHref}
            className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
          >
            {content.backToHubLabel}
          </SmartLink>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-sm">
            <EmergencyBanner
              variant="smart"
              phone={content.alertPhone}
              showContext={false}
            />
          </div>

          <InlineAlert tone="amber">{content.inlineAlertText}</InlineAlert>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E31B23] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              aria-controls="request-drawer"
            >
              <Mail className="h-4 w-4" />
              {content.drawerButtonLabel}
            </button>

            <button
              type="button"
              onClick={jumpToServices}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
            >
              <Phone className="h-4 w-4" />
              {content.browseButtonLabel}
            </button>
          </div>
        </div>
      </SafetyCard>

      <SafetyCard id="services" className="mt-4 scroll-mt-24">
        <div className="mb-4">
          <h2 className="text-[18px] font-semibold tracking-tight text-slate-900">
            {content.browseTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {content.browseDescription}
          </p>
        </div>

        <SupportDirectory services={content.services as Service[]} preset={{}} />
      </SafetyCard>

      <EmergencyFAB phone={content.alertPhone} />

      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
            />

            <motion.aside
              id="request-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={content.drawerTitle}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-auto rounded-t-[28px] bg-white p-4 shadow-xl ring-1 ring-black/5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-slate-900">
                    {content.drawerTitle}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {content.drawerDescription}
                  </p>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <SupportRequestForm />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </SafetyPageShell>
  );
}
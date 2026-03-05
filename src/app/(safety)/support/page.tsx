"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, X } from "lucide-react";
import { FaDoorOpen, FaPhoneAlt, FaShieldAlt } from "react-icons/fa";
import { EmergencyBanner, EmergencyFAB, ServiceStatusBar } from "@/components/SystemLayer";
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

type Settings = {
  alert: { text: string; phone: string; cta: string };
  status: { name: string; ok: boolean; href?: string }[];
  shortcuts: { label: string; cat?: string; q?: string }[];
  services: Service[];
  faqs: { q: string; a: string; tags?: string[] }[]; // still in payload, but we don't show it
};

export default function SupportPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/support/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  const jumpToServices = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  if (!settings) {
    return (
      <main className="min-h-screen bg-[#F7F8FA]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">Loading…</div>
      </main>
    );
  }

  return (
    <SafetyPageShell
      strip={
        <EmergencyStrip
          ariaLabel="Emergency quick actions"
          items={[
            {
              label: "Call Security",
              href: toTelHref(settings.alert.phone),
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
              href: "/exit-navigation",
              icon: <FaDoorOpen />,
              tone: "light",
              ariaLabel: "Open exit navigation",
            },
          ]}
        />
      }
    >
      {/* Header (clear + calm) */}
      <SafetyCard>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <PageTitleBlock
              eyebrow={<Eyebrow>Safety Hub</Eyebrow>}
              title="Get Help / Report"
              description="Use this page for non-urgent help and service contacts. If it’s urgent, call Security or 999."
            />
          </div>

          <SmartLink
            href="/emergency"
            className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
          >
            Back to hub
          </SmartLink>
        </div>

        <div className="mt-4 space-y-4">
          <EmergencyBanner variant="smart" phone={settings.alert.phone} showContext={false} />
          <ServiceStatusBar items={settings.status} />

          <InlineAlert tone="amber">
            If there is immediate danger or emergency, call Security or 999 instead of submitting a request.
          </InlineAlert>

          {/* Minimal actions only */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#E31B23] px-4 py-3 text-sm font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              aria-controls="request-drawer"
            >
              <Mail className="h-4 w-4" />
              Send request
            </button>

            <button
              type="button"
              onClick={jumpToServices}
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
            >
              Browse services
            </button>
          </div>
        </div>
      </SafetyCard>

      {/* One single browse/search area (no duplicates) */}
      <SafetyCard id="services" className="mt-4 scroll-mt-24">
        <h2 className="text-[15px] font-semibold text-slate-900">Browse services</h2>
        <p className="mt-1 text-sm text-slate-600">
          Find the right department and contact method quickly.
        </p>

        <div className="mt-4">
          <SupportDirectory services={settings.services} preset={{}} />
        </div>
      </SafetyCard>

      <EmergencyFAB phone={settings.alert.phone} />

      {/* Request drawer */}
      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />

            <motion.aside
              id="request-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Send a request"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-auto rounded-t-[28px] bg-white p-4 shadow-xl ring-1 ring-black/5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-slate-900">Send a request</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Non-urgent support and after-hours requests.
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
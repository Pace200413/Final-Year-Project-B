"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Users,
  Shield,
  LogIn,
  MapPin,
  DoorOpen,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import {
  CMS_PAGE_CONFIG,
  type BookARoomContent,
} from "@/lib/page-cms";

const FALLBACK_CONTENT: BookARoomContent =
  CMS_PAGE_CONFIG["book-a-room"].defaultContent;

const ICONS = {
  Clock3,
  Users,
  Shield,
  LogIn,
  MapPin,
  DoorOpen,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
};

export default function BookARoomPage() {
  const [cms, setCms] = useState<BookARoomContent>(FALLBACK_CONTENT);
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch("/api/cms/book-a-room", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!alive) return;
        setCms((json?.content ?? FALLBACK_CONTENT) as BookARoomContent);
      } catch {}
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const quickInfo = cms.quickInfo ?? FALLBACK_CONTENT.quickInfo;
  const steps = cms.steps ?? FALLBACK_CONTENT.steps;
  const rules = cms.rules ?? FALLBACK_CONTENT.rules;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.08),transparent_28%),#f8fafc] pb-24">
      <div className="mx-auto w-full max-w-md px-4 py-4">
        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-100 px-5 pb-4 pt-5">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-100">
                <BookOpen className="h-3.5 w-3.5" />
                Library
              </div>
            </div>

            <h1 className="mt-4 text-[34px] font-semibold leading-tight tracking-tight text-slate-900">
              {cms.hero.title}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {cms.hero.subtitle}
            </p>

            <a
              href={cms.hero.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-between rounded-3xl border border-red-100 bg-gradient-to-r from-red-50 to-white px-4 py-4 shadow-sm transition active:scale-[0.99]"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {cms.hero.ctaLabel}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Open the room booking system
                </p>
              </div>

              <div className="ml-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md shadow-red-600/20">
                <ExternalLink className="h-4 w-4" />
              </div>
            </a>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {quickInfo.map((item) => {
                const Icon = ICONS[item.icon as keyof typeof ICONS] ?? Clock3;

                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] font-medium text-slate-700 ${
                      item.wide ? "col-span-2" : ""
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-slate-900" />
                    <span className="leading-4">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 px-4 py-4">
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3">
                <h2 className="text-[15px] font-semibold text-slate-900">How to book</h2>
                <p className="text-sm text-slate-500">Tap each step to view details</p>
              </div>

              <div className="space-y-2.5">
                {steps.map((step, index) => {
                  const Icon = ICONS[step.icon as keyof typeof ICONS] ?? LogIn;
                  const isOpen = openStep === index;

                  return (
                    <div
                      key={step.title}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenStep(isOpen ? null : index)}
                        className="flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-slate-50"
                      >
                        <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[18px] bg-slate-950 text-white">
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              {index + 1}
                            </span>
                            <h3 className="text-sm font-semibold leading-5 text-slate-900">
                              {step.title}
                            </h3>
                          </div>
                        </div>

                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`grid transition-all duration-200 ${
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t border-slate-100 px-3.5 pb-3.5 pt-2.5">
                            <p className="pl-[48px] text-sm leading-6 text-slate-600">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setRulesOpen((prev) => !prev)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left active:bg-slate-50"
              >
                <div>
                  <h2 className="text-[15px] font-semibold text-slate-900">Conditions of use</h2>
                  <p className="text-sm text-slate-500">Tap to view booking rules</p>
                </div>

                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-400 transition ${
                    rulesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-200 ${
                  rulesOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                    <ul className="space-y-2">
                      {rules.map((rule) => (
                        <li
                          key={rule}
                          className="flex gap-3 rounded-2xl bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-700"
                        >
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-slate-900 p-4 text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
              <h3 className="text-sm font-semibold">Ready to continue?</h3>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Make sure your group meets the booking requirements before proceeding.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
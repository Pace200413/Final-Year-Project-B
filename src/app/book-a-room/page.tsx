// src/app/book-a-room/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
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

const SKEDDA_URL = "https://myvenuehub.skedda.com/";

const steps = [
  {
    icon: LogIn,
    title: "Sign in",
    desc: "Log in to Skedda to begin your booking.",
  },
  {
    icon: MapPin,
    title: "Location",
    desc: "Select Library discussion rooms.",
  },
  {
    icon: DoorOpen,
    title: "Pick room",
    desc: "Choose an available room. Green means available.",
  },
  {
    icon: CalendarDays,
    title: "Set booking",
    desc: "Choose date, time, and duration. Maximum is 2 hours.",
  },
  {
    icon: Users,
    title: "Attendees",
    desc: "Enter the total number of users.",
  },
  {
    icon: AlertCircle,
    title: "Unconfirmed",
    desc: "Mark the booking request as unconfirmed.",
  },
  {
    icon: CheckCircle2,
    title: "Confirm",
    desc: "Accept the conditions and confirm your booking.",
  },
];

const rules = [
  "Minimum 3 users.",
  "Maximum 2 hours per booking.",
  "Check-in is required.",
  "Unattended rooms for 15 minutes may be terminated.",
  "Keep noise at a reasonable level.",
  "Do not move furniture.",
  "Do not leave belongings unattended.",
  "Keep the room neat and orderly.",
];

const quickInfo = [
  { icon: Clock3, label: "2h max" },
  { icon: Users, label: "Min 3 users" },
  { icon: Shield, label: "Check-in required", wide: true },
];

export default function BookARoomPage() {
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [rulesOpen, setRulesOpen] = useState(false);

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
              Discussion Room Booking
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Book a library discussion room through Skedda.
            </p>

          <a
            href={SKEDDA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-between rounded-3xl border border-red-100 bg-gradient-to-r from-red-50 to-white px-4 py-4 shadow-sm transition active:scale-[0.99]"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">Book on Skedda</p>
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
                const Icon = item.icon;
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
                  const Icon = step.icon;
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
// src/app/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { ChatLauncher } from "@/components/MobileShell";
import { SearchBar, TileCard } from "@/components/SupportUI";
import { ServiceStatusBar } from "@/components/SystemLayer";
import {
  Phone,
  Shield,
  Compass,
  Map as MapIcon,
  LifeBuoy,
  CalendarDays,
  AlertTriangle,
  BookOpen,
  GraduationCap,
} from "lucide-react";

/* ---------- Dev-only: subtle staff access ---------- */
const IS_STAFF_LINK = process.env.NODE_ENV !== "production";

/* ---------- Layout helpers ---------- */
type SectionProps = { id?: string; title: string; subtitle?: string; children: ReactNode };

const CONTAINER = "mx-auto w-full max-w-[1280px] container-px";

const Section = ({ id, title, subtitle, children }: SectionProps) => (
  <section id={id} className={`${CONTAINER} mt-8 scroll-mt-24`}>
    <div className="mb-3">
      <h2 className="text-base font-semibold">{title}</h2>
      {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
    </div>
    {children}
  </section>
);

const GRID_2 = "grid grid-cols-2 gap-3 sm:gap-4";
const GRID_4 = "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4";

const Wrap = ({ children }: { children: ReactNode }) => (
  <div className="min-w-0 w-full">{children}</div>
);

function TopHeroNavigation() {
  return (
    <div className="relative overflow-hidden rounded-3xl ring-1 ring-black/5 shadow-[0_26px_80px_rgba(0,0,0,.22)]">
      <div
        aria-hidden
        className="absolute inset-0
          [background:radial-gradient(120%_140%_at_16%_10%,#ff7a7a_0%,#D42A30_30%,#8D1116_62%,#07070A_100%)]"
      />

      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.28]
          [clip-path:polygon(0%_0%,62%_0%,0%_72%)]
          [background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(255,255,255,0))]
          [-webkit-clip-path:polygon(0%_0%,62%_0%,0%_72%)]"
      />

      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35]
          [clip-path:polygon(100%_100%,40%_100%,100%_38%)]
          [background:linear-gradient(315deg,rgba(0,0,0,.85),rgba(0,0,0,0))]
          [-webkit-clip-path:polygon(100%_100%,40%_100%,100%_38%)]"
      />

      <div
        aria-hidden
        className="absolute inset-0 opacity-85
          [background:radial-gradient(circle_at_18%_12%,rgba(255,255,255,.28),transparent_46%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-65
          [background:linear-gradient(180deg,rgba(255,255,255,.12),transparent_42%)]"
      />

      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.12]
          [background:linear-gradient(135deg,transparent_0%,transparent_46%,rgba(255,255,255,.55)_50%,transparent_54%,transparent_100%)]"
      />

      <div
        aria-hidden
        className="absolute inset-0 opacity-80
          [background:radial-gradient(120%_120%_at_50%_120%,rgba(0,0,0,.55),transparent_56%)]"
      />

      <div aria-hidden className="absolute inset-0 rounded-3xl ring-1 ring-white/18" />
      <div
        aria-hidden
        className="absolute inset-0 rounded-3xl
          shadow-[inset_0_1px_0_rgba(255,255,255,.18),inset_0_-14px_34px_rgba(0,0,0,.18)]"
      />

      <div className="relative p-5 sm:p-6 text-white">
        <div
          className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/18
                     supports-[backdrop-filter]:backdrop-blur-xl"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden />
          Campus Navigation
        </div>

        <h1 className="mt-3 text-[24px] sm:text-[28px] font-semibold tracking-tight leading-tight">
          Find your way in seconds.
        </h1>

        <p className="mt-1.5 max-w-[52ch] text-[13.5px] text-white/85">
          Turn-by-turn directions, building maps, and accessible routes — designed to feel like a real campus product.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Link
            href="/navigate"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#B0171E]
                       shadow-[0_14px_34px_rgba(0,0,0,.22)] ring-1 ring-white/70
                       hover:bg-white/95 active:scale-[0.99]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#8D1116]"
          >
            Start navigation →
          </Link>

          <Link
            href="/navigate/map"
            className="relative inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white
                       bg-white/10 ring-1 ring-white/22
                       supports-[backdrop-filter]:backdrop-blur-xl
                       shadow-[0_12px_26px_rgba(0,0,0,.16)]
                       hover:bg-white/14 active:scale-[0.99]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#8D1116]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl
                         [background:linear-gradient(180deg,rgba(255,255,255,.18),transparent_55%)]"
            />
            <span className="relative">Open maps</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  useEffect(() => {
    const isTypingTarget = (el: HTMLElement | null) => {
      if (!el) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
    };

    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;

      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.defaultPrevented || isTypingTarget(el)) return;

      if (e.key === "/") {
        const input = document.querySelector('input[type="search"], input[role="searchbox"]') as
          | HTMLInputElement
          | null;
        if (input) {
          e.preventDefault();
          input.focus();
        }
        return;
      }

      if (e.key.toLowerCase() === "g") {
        const map: Record<string, string> = {
          n: "#navigation",
          e: "#emergency",
          s: "#support-events",
          a: "#academics",
          t: "#student-tools",
          d: "/admin",
        };

        let alive = true;
        let timeoutId: number | null = null;

        const cleanup = () => {
          if (!alive) return;
          alive = false;
          window.removeEventListener("keydown", sub, true);
          if (timeoutId !== null) window.clearTimeout(timeoutId);
        };

        const sub = (ev: KeyboardEvent) => {
          const t = ev.target as HTMLElement | null;
          if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
          if (isTypingTarget(t)) return;

          const target = map[ev.key.toLowerCase()];
          if (!target) return;

          ev.preventDefault();

          if (target.startsWith("#")) {
            document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
            cleanup();
            return;
          }

          if (IS_STAFF_LINK) window.location.assign(target);
          cleanup();
        };

        window.addEventListener("keydown", sub, true);
        timeoutId = window.setTimeout(cleanup, 1200);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen pb-3 selection:bg-slate-900/90 selection:text-white">
      <div className={`${CONTAINER} mt-0`}>
        <TopHeroNavigation />
      </div>

      <div className={`${CONTAINER} mt-4`}>
        <SearchBar />
      </div>

      <div className={`${CONTAINER} mt-3`}>
        <ServiceStatusBar />
      </div>

      <Section id="navigation" title="Campus Navigation">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
    <TileCard
      href="/navigate"
      title="Navigate"
      subtitle="Fast turn-by-turn campus directions and accessible routes"
      icon={<Compass className="h-5 w-5" />}
      variant="spotlight"
      badge="Start here"
      status="open"
    />
    <TileCard
      href="/navigate/map"
      title="Maps"
      subtitle="Buildings, lecture halls, labs and campus facilities"
      icon={<MapIcon className="h-5 w-5" />}
      variant="spotlight"
      badge="Latest map"
      status="updated"
    />
  </div>
</Section>

<Section
  id="emergency"
  title="Emergency & Safety"
  subtitle="Security contacts, evacuation routes, and safety guidance."
>
  <div className={GRID_4}>
    <Wrap>
      <TileCard
        href="/security-contact"
        title="Security Contact"
        icon={<Phone className="h-5 w-5" />}
        tone="red"
      />
    </Wrap>
    <Wrap>
      <TileCard
        href="/exit-navigation"
        title="Exit Navigation"
        icon={<Compass className="h-5 w-5" />}
        tone="red"
      />
    </Wrap>
    <Wrap>
      <TileCard
        href="/safety"
        title="Staying Safe"
        icon={<Shield className="h-5 w-5" />}
        tone="red"
      />
    </Wrap>
    <Wrap>
      <TileCard
        href="/emergency"
        title="Emergency Hub"
        icon={<AlertTriangle className="h-5 w-5" />}
        tone="red"
      />
    </Wrap>
  </div>
</Section>

<Section
  id="support-events"
  title="Support & Events"
  subtitle="Get help fast and see what’s happening on campus."
>
  <div className={GRID_2}>
    <Wrap>
      <TileCard
        href="/support"
        title="Live Support"
        icon={<LifeBuoy className="h-5 w-5" />}
      />
    </Wrap>
    <Wrap>
      <TileCard
        href="/events"
        title="Events"
        icon={<CalendarDays className="h-5 w-5" />}
      />
    </Wrap>
  </div>
</Section>

        <Section
          id="academics"
          title="Study & Library"
          subtitle="Helpful student resources and room booking."
        >
          <div className={GRID_2}>
            <Wrap>
              <TileCard
                href="/new-to-swinburne"
                title="New to Swinburne"
                icon={<GraduationCap className="h-5 w-5" />}
              />
            </Wrap>
            <Wrap>
              <TileCard
                href="/book-a-room"
                title="Book a Room"
                icon={<BookOpen className="h-5 w-5" />}
              />
            </Wrap>
          </div>
        </Section>
      <ChatLauncher />
    </div>
  );
}
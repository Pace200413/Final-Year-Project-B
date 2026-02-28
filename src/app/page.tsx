"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {FeatureBanner} from "@/components/MobileShell";
import {SearchBar} from "@/components/SupportUI";
import {PinnedShortcuts} from "@/components/MobileShell";
import {ServiceStatusBar} from "@/components/SystemLayer";
import {TileCard} from "@/components/SupportUI";
import type { EventItem } from "@/components/MobileShell";
import {MiniEvents} from "@/components/MobileShell";
import {ChatLauncher} from "@/components/MobileShell";

import {
  PhoneIcon,
  ShieldIcon,
  CompassIcon,
  MapPinIcon,
  ChatIcon,
  CalendarIcon,
  BookIcon,
} from "@/components/MobileShell";

/* ---------- Dev-only: subtle staff access ---------- */
const IS_STAFF_LINK = process.env.NODE_ENV !== "production";

/* ---------- Data ---------- */
const EVENTS: EventItem[] = [
  { date: "10 Feb", title: "Orientation: 7 things before starting", location: "A002 Lecture Hall" },
  { date: "5 Mar", title: "AI Student Meetup", location: "Innovation Hub" },
];

/* ---------- Layout helpers ---------- */
type SectionProps = { id?: string; title: string; children: ReactNode };

const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 sm:px-6";

const Section = ({ id, title, children }: SectionProps) => (
  <section id={id} className={`${CONTAINER} mt-8 scroll-mt-24`}>
    <h3 className="mb-3 text-base font-semibold">{title}</h3>
    {children}
  </section>
);

const GRID = "grid grid-cols-2 gap-3 sm:gap-4";
const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-w-0 w-full">{children}</div>
);

export default function Page() {
  // Quick keys: "/" focuses search, "g" + key jumps to sections
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.defaultPrevented || tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "/") {
        const input = document.querySelector(
          'input[type="search"], input[role="searchbox"]'
        ) as HTMLInputElement | null;
        if (input) {
          e.preventDefault();
          input.focus();
        }
      }

      if (e.key.toLowerCase() === "g") {
        const once = (ev: KeyboardEvent) => {
          const map: Record<string, string> = {
            n: "#navigation",
            e: "#emergency",
            s: "#support-events",
            a: "#academics",
            t: "#student-tools",
            u: "#events", // upcoming events (bottom)
            d: "/admin",
          };
          const target = map[ev.key.toLowerCase()];
          if (!target) return;
          if (target.startsWith("#")) {
            document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
          } else if (IS_STAFF_LINK) {
            window.location.assign(target);
          }
        };
        window.addEventListener("keydown", once, { once: true, capture: true });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen selection:bg-slate-900/90 selection:text-white">
      {/* Hero */}
      <div className={`${CONTAINER} mt-0`}>
        <FeatureBanner />
      </div>

      {/* Search */}
      <div className={`${CONTAINER} mt-4`}>
        <SearchBar />
      </div>

      {/* Utility row */}
      <PinnedShortcuts />
      <ServiceStatusBar />

      {/* ===== PRIORITY ORDER STARTS HERE ===== */}

      {/* 1) Campus Navigation (MAIN) */}
      <Section id="navigation" title="Campus Navigation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <TileCard
            href="/navigate"
            title="Navigate"
            subtitle="Turn-by-turn campus directions and accessible routes"
            icon={<CompassIcon />}
            variant="spotlight"
            badge="Start here"
            status="open"
          />
          <TileCard
            href="/navigate/map"
            title="Maps"
            subtitle="Browse buildings, labs, lecture halls and facilities"
            icon={<MapPinIcon />}
            variant="spotlight"
            badge="Updated"
          />
        </div>
      </Section>


      {/* 2) Emergency & Safety */}
      <Section id="emergency" title="Emergency & Safety">
        <div className={GRID}>
          <Wrap>
            <TileCard href="/emergency/security-contact" title="Security Contact" icon={<PhoneIcon />} tone="red" />
          </Wrap>
          <Wrap>
            <TileCard href="/exit-navigation" title="Exit Navigation" icon={<CompassIcon />} tone="red" />
          </Wrap>
          <Wrap>
            <TileCard href="/safety" title="Staying Safe" icon={<ShieldIcon />} tone="red" />
          </Wrap>
          <Wrap>
            <TileCard href="/emergency" title="Emergency Hub" icon={<ShieldIcon />} tone="red" />
          </Wrap>
        </div>
      </Section>

      {/* 3) Support & Events */}
      <Section id="support-events" title="Support & Events">
        <div className={GRID}>
          <Wrap>
            <TileCard href="/support" title="Live Support" icon={<ChatIcon />} />
          </Wrap>
          <Wrap>
            <TileCard href="/events" title="Events" icon={<CalendarIcon />} />
          </Wrap>
        </div>
      </Section>

      {/* 4) Academics */}
      <Section id="academics" title="Academics">
        <div className={GRID}>
          <Wrap>
            <TileCard href="/timetable" title="Timetable" icon={<CalendarIcon />} />
          </Wrap>
          <Wrap>
            <TileCard href="/library" title="Library" icon={<BookIcon />} />
          </Wrap>
        </div>
      </Section>

      {/* 5) Student Tools (Canvas & Student Portal) */}
      <Section id="student-tools" title="Student Tools">
        <div className={GRID}>
          <Wrap>
            <TileCard
              href="https://www.swinburne.edu.my/canvas/"
              title="Canvas"
              icon={
                <Image
                  src="/images/canvas-logo.png"
                  alt="Canvas"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              }
              iconVariant="image"
              external
            />
          </Wrap>

          <Wrap>
            <TileCard
              href="https://login.microsoftonline.com/3f639a9b-27c8-4403-82b1-ebfb88052d15/wsfed?wa=wsignin1.0&wtrealm=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&wctx=rm%3d0%26id%3dpassive%26ru%3dsecure%2fstudent%2fstuportal.aspx&wreply=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&AppType=Portal&Role=STUDENT"
              title="Student Portal"
              icon={
                <Image
                  src="/images/swinburne-student_portal.png"
                  alt="Student Portal"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              }
              iconVariant="image"
              external
            />
          </Wrap>
        </div>
      </Section>

      {/* 6) Upcoming events (moved to bottom) */}
      <Section id="events" title="Upcoming events">
        <div className="min-h-[96px]">
          <MiniEvents items={EVENTS} limit={2} showHeading={false} showSeeAll={false} />
        </div>
      </Section>

      {/* ===== PRIORITY ORDER ENDS HERE ===== */}

      <footer className={`${CONTAINER} my-12 text-xs text-slate-500`}>
        © Swinburne 2025 · Privacy · We respectfully acknowledge the Wurundjeri People…
        {IS_STAFF_LINK && (
          <Link
            href="/admin"
            className="ml-3 underline decoration-dotted hover:text-slate-600"
            aria-label="Staff console"
          >
            Staff console
          </Link>
        )}
      </footer>

      <ChatLauncher />
    </div>
  );
}

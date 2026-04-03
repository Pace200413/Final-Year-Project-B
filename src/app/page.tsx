"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { PinnedShortcuts } from "@/components/MobileShell";
import { TileCard } from "@/components/SupportUI";
import { ServiceStatusBar } from "@/components/SystemLayer";
import {
  getDevicePrefsSnapshot,
  HOME_SCROLL_OBSERVE_IDS,
  resolveHomeScrollTarget,
  updateDevicePrefs,
  useDevicePrefs,
  type HomeScrollSectionId,
} from "@/lib/device-prefs";
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
  <section id={id} className={`${CONTAINER} mt-6 scroll-mt-24`}>
    <div className="mb-2.5">
      <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-0.5 text-[12px] text-slate-500">{subtitle}</p> : null}
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
    <div
      id="home-top"
      className="relative overflow-hidden rounded-[28px] ring-1 ring-black/5 shadow-[0_18px_48px_rgba(0,0,0,.18)]"
    >
      <div
        aria-hidden
        className="absolute inset-0 [background:radial-gradient(120%_140%_at_16%_10%,#ff8b8b_0%,#D42A30_32%,#8D1116_66%,#120406_100%)]"
      />

      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.22]
          [clip-path:polygon(0%_0%,58%_0%,0%_76%)]
          [background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(255,255,255,0))]
          [-webkit-clip-path:polygon(0%_0%,58%_0%,0%_76%)]"
      />

      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.28]
          [clip-path:polygon(100%_100%,42%_100%,100%_42%)]
          [background:linear-gradient(315deg,rgba(0,0,0,.78),rgba(0,0,0,0))]
          [-webkit-clip-path:polygon(100%_100%,42%_100%,100%_42%)]"
      />

      <div
        aria-hidden
        className="absolute inset-0 opacity-70
          [background:radial-gradient(circle_at_18%_12%,rgba(255,255,255,.24),transparent_42%)]"
      />

      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.1]
          [background:linear-gradient(135deg,transparent_0%,transparent_46%,rgba(255,255,255,.48)_50%,transparent_54%,transparent_100%)]"
      />

      <div className="relative px-5 py-5 text-white sm:px-6 sm:py-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/18 supports-[backdrop-filter]:backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden />
          Campus Navigation
        </div>

        <h1 className="mt-3 text-[25px] font-semibold leading-tight tracking-tight sm:text-[29px]">
          Find your way in seconds
        </h1>

        <p className="mt-2 text-[13.5px] leading-5 text-white/88">
          Achievement through learning.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <Link
            href="/navigate"
            className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#B0171E]
                       shadow-[0_12px_28px_rgba(0,0,0,.22)] ring-1 ring-white/70
                       hover:bg-white/95 active:scale-[0.99]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#8D1116]"
          >
            Start navigation
          </Link>

          <Link
            href="/navigate/map"
className="inline-flex items-center justify-center rounded-2xl border border-white/16 bg-white/[0.03]
           px-5 py-3 text-sm font-semibold text-white/92
           supports-[backdrop-filter]:backdrop-blur-md
           hover:bg-white/[0.06] hover:border-white/24
           active:scale-[0.99]
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#8D1116]"
          >
            Open maps
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const pathname = usePathname();
  const { prefs } = useDevicePrefs();

  function scrollMotion(): ScrollBehavior {
    return getDevicePrefsSnapshot().reduceMotion ? "auto" : "smooth";
  }

  useEffect(() => {
    if (pathname !== "/") return;

    const id = requestAnimationFrame(() => {
      const hash = window.location.hash.replace(/^#/, "");
      const hashOk =
        hash && (HOME_SCROLL_OBSERVE_IDS as readonly string[]).includes(hash);

      if (hashOk) {
        document
          .getElementById(hash)
          ?.scrollIntoView({ behavior: scrollMotion(), block: "start" });
        return;
      }

      const target = resolveHomeScrollTarget(getDevicePrefsSnapshot());
      if (target === "top") {
        window.scrollTo({ top: 0, behavior: scrollMotion() });
        return;
      }
      document
        .getElementById(target)
        ?.scrollIntoView({ behavior: scrollMotion(), block: "start" });
    });

    return () => cancelAnimationFrame(id);
  }, [
    pathname,
    prefs.defaultHomeSection,
    prefs.rememberLastHomeSection,
    prefs.lastHomeSection,
  ]);

  useEffect(() => {
    if (pathname !== "/") return;
    if (!prefs.rememberLastHomeSection) return;

    let debounce: number | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.3)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const sid = best?.target?.id;
        if (
          !sid ||
          !(HOME_SCROLL_OBSERVE_IDS as readonly string[]).includes(sid)
        ) {
          return;
        }
        window.clearTimeout(debounce);
        debounce = window.setTimeout(() => {
          updateDevicePrefs({ lastHomeSection: sid as HomeScrollSectionId });
        }, 380);
      },
      { threshold: [0, 0.2, 0.3, 0.5, 0.75, 1], rootMargin: "-18% 0px -40% 0px" }
    );

    HOME_SCROLL_OBSERVE_IDS.forEach((sectionId) => {
      const el = document.getElementById(sectionId);
      if (el) observer.observe(el);
    });

    return () => {
      window.clearTimeout(debounce);
      observer.disconnect();
    };
  }, [pathname, prefs.rememberLastHomeSection]);

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
            document.querySelector(target)?.scrollIntoView({
              behavior: getDevicePrefsSnapshot().reduceMotion ? "auto" : "smooth",
              block: "start",
            });
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

      <div className={`${CONTAINER} mt-3`}>
        <ServiceStatusBar />
      </div>

      <PinnedShortcuts />


      <Section id="navigation" title="Campus Navigation">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
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
    </div>
  );
}
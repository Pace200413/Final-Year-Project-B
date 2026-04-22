"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { getCookie, setCookie, deleteCookie } from "@/lib/client";
import { useDevicePrefs } from "@/lib/device-prefs";

/* =============================================================================
   EmergencyBanner.tsx
============================================================================= */

type EmergencyBannerProps = {
  phone: string;
  context?: string;
  variant?: "default" | "smart";
  showContext?: boolean;
};

export function EmergencyBanner({
  phone,
  context = "Security: 24/7",
  variant = "default",
  showContext = true,
}: EmergencyBannerProps) {
  const tel = `tel:${phone.replace(/[^0-9]/g, "")}`;

  if (variant === "smart") {
    return (
      <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-black/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span aria-hidden>🚨</span>
          <p className="flex-1 text-sm text-rose-900">
            Need urgent help? Call Campus Security{" "}
            <a className="font-semibold underline" href={tel}>
              {phone}
            </a>
            .
          </p>
          {showContext && (
            <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200 md:inline-flex">
              <span className="inline-block size-1.5 rounded-full bg-current" /> {context}
            </span>
          )}
          <a
            href={tel}
            className="hidden items-center gap-2 rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 px-3 py-2 text-white shadow-sm ring-1 ring-rose-600/20 transition hover:from-rose-500 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40 sm:inline-flex"
          >
            <Phone className="h-4 w-4" />
            Call now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      role="note"
      aria-label="Emergency notice"
      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
    >
      <div className="flex items-center gap-3">
        <span aria-hidden>🚨</span>
        <p className="flex-1">
          Need urgent help? Call Campus Security{" "}
          <a className="font-semibold underline" href={tel}>
            {phone}
          </a>{" "}
          — available 24/7.
        </p>
        <a
          href={tel}
          className="hidden items-center gap-2 rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 px-3 py-2 text-white shadow-sm ring-1 ring-rose-600/20 transition hover:from-rose-500 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40 sm:inline-flex"
        >
          <Phone className="h-4 w-4" />
          Call now
        </a>
      </div>
    </div>
  );
}

/* =============================================================================
   EmergencyFAB.tsx
============================================================================= */

export function EmergencyFAB({ phone }: { phone: string }) {
  const tel = `tel:${phone.replace(/[^0-9]/g, "")}`;
  return (
    <a
      href={tel}
      className="fixed bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-rose-700 sm:hidden"
      aria-label="Call Campus Security now"
    >
      🚨 Emergency
    </a>
  );
}

/* =============================================================================
   ServiceStatusBar.tsx
============================================================================= */

export type StatusItem = {
  name: string;
  ok: boolean;
  href?: string;
  tip?: string;
  external?: boolean;
};

const CANVAS_URL = "https://www.swinburne.edu.my/canvas/";
const STUDENT_PORTAL_URL = "https://sisportal-100380.campusnexus.cloud/CMCPortal/";

export const STATUS_ITEMS: StatusItem[] = [
  { name: "Canvas", ok: true, href: CANVAS_URL, tip: "Operational", external: true },
  { name: "Student Portal", ok: true, href: STUDENT_PORTAL_URL, tip: "Operational", external: true },
];

function Dot({ ok }: { ok: boolean }) {
  return <span aria-hidden className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} />;
}

export function ServiceStatusBar({ items = STATUS_ITEMS }: { items?: StatusItem[] }) {
  const { prefs } = useDevicePrefs();

  const chipClass =
    "group rounded-[22px] px-3.5 py-2.5 bg-white ring-1 ring-slate-200/80 " +
    "shadow-[0_8px_18px_rgba(15,23,42,.05)] " +
    (prefs.reduceMotion
      ? ""
      : "transition hover:-translate-y-[1px] hover:shadow-[0_12px_24px_rgba(15,23,42,.08)] hover:ring-slate-300 ") +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2";

  return (
    <section aria-label="Service status">
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((it, idx) => {
          const statusText = it.tip ?? (it.ok ? "Operational" : "Degraded");
          const href = it.href;
          const external = !!href && (it.external || /^https?:\/\//i.test(href));

          const content = (
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${it.ok ? "bg-emerald-500" : "bg-amber-500"}`}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-semibold text-slate-900">
                  {it.name}
                </div>
                <div className="text-[11px] text-slate-500">{statusText}</div>
              </div>
              {external ? (
                <span className="text-[11px] font-semibold text-slate-400" aria-hidden>
                  ↗
                </span>
              ) : null}
            </div>
          );

          if (!href) {
            return (
              <div key={`${it.name}-${idx}`} className={chipClass}>
                {content}
              </div>
            );
          }

          if (external) {
            return (
              <a
                key={`${it.name}-${idx}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={chipClass}
                aria-label={`${it.name} ${statusText} (opens in new tab)`}
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={`${it.name}-${idx}`} href={href} className={chipClass}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* =============================================================================
   ServiceWorkerRegistration.tsx
============================================================================= */

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  }, []);

  return null;
}

/* =============================================================================
   AppearanceClient.tsx
============================================================================= */

type TextSize = "default" | "large";
type Contrast = "normal" | "high";
type Motion = "standard" | "reduced";
type Density = "comfortable" | "compact";

const TEXT_KEY = "a11y_text";
const CONTRAST_KEY = "a11y_contrast";
const MOTION_KEY = "a11y_motion";
const DENSITY_KEY = "a11y_density";

function applyAppearance(
  text: TextSize,
  contrast: Contrast,
  motion: Motion,
  density: Density
) {
  const root = document.documentElement;

  root.classList.remove("dark");
  root.classList.toggle("a11y-text-large", text === "large");
  root.classList.toggle("a11y-contrast-high", contrast === "high");
  root.classList.toggle("a11y-motion-reduced", motion === "reduced");
  root.classList.toggle("a11y-density-compact", density === "compact");
  root.style.colorScheme = "light";
}

function setThemeColorMeta() {
  let el = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.name = "theme-color";
    document.head.appendChild(el);
  }
  el.content = "#F2F2F7";
}

export function AppearanceClient(props?: {
  textSize?: TextSize;
  contrast?: Contrast;
  motion?: Motion;
  density?: Density;
}) {
  const { textSize, contrast, motion, density } = props ?? {};

  useEffect(() => {
    const readAndApply = () => {
      const rawText = textSize ?? localStorage.getItem(TEXT_KEY);
      const rawContrast = contrast ?? localStorage.getItem(CONTRAST_KEY);
      const rawMotion = motion ?? localStorage.getItem(MOTION_KEY);
      const rawDensity = density ?? localStorage.getItem(DENSITY_KEY);

      const effectiveText: TextSize = rawText === "large" ? "large" : "default";
      const effectiveContrast: Contrast = rawContrast === "high" ? "high" : "normal";
      const effectiveMotion: Motion = rawMotion === "reduced" ? "reduced" : "standard";
      const effectiveDensity: Density = rawDensity === "compact" ? "compact" : "comfortable";

      applyAppearance(
        effectiveText,
        effectiveContrast,
        effectiveMotion,
        effectiveDensity
      );
      setThemeColorMeta();
    };

    readAndApply();

    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if ([TEXT_KEY, CONTRAST_KEY, MOTION_KEY, DENSITY_KEY].includes(e.key)) {
        readAndApply();
      }
    };

    const onAppearanceChange = () => {
      readAndApply();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("app-appearance-change", onAppearanceChange);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("app-appearance-change", onAppearanceChange);
    };
  }, [textSize, contrast, motion, density]);

  return null;
}

/* =============================================================================
   DevSwitches.tsx
============================================================================= */

type Role = "student" | "staff" | "admin";

export function DevSwitches() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [roles, setRoles] = useState<Record<Role, boolean>>({ student: false, staff: false, admin: false });
  const [workspace, setWorkspace] = useState<Role>("student");

  useEffect(() => {
    const auth = getCookie("auth") === "1";
    setSignedIn(auth);

    const rolesCsv = (getCookie("roles") ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase());

    const next: Record<Role, boolean> = { student: false, staff: false, admin: false };
    rolesCsv.forEach((r) => {
      if (r === "student" || r === "staff" || r === "admin") next[r] = true;
    });
    setRoles(next);

    const roleCookie = getCookie("role");
    if (roleCookie === "student" || roleCookie === "staff" || roleCookie === "admin") {
      setWorkspace(roleCookie);
    } else {
      const first = (["student", "staff", "admin"] as Role[]).find((r) => next[r]);
      if (first) setWorkspace(first);
    }
  }, []);

  const toggleRole = (r: Role) => setRoles((o) => ({ ...o, [r]: !o[r] }));

  const applyChanges = () => {
    const selected = (Object.keys(roles) as Role[]).filter((r) => roles[r]);

    if (signedIn && selected.length === 0) {
      alert("Pick at least one role when signed in.");
      return;
    }

    if (signedIn) setCookie("auth", "1");
    else deleteCookie("auth");

    if (selected.length) setCookie("roles", selected.join(","));
    else deleteCookie("roles");

    const ws = selected.includes(workspace) ? workspace : (selected[0] ?? "student");
    if (selected.length) setCookie("role", ws);
    else deleteCookie("role");

    location.reload();
  };

  const resetGuest = () => {
    deleteCookie("auth");
    deleteCookie("roles");
    deleteCookie("role");
    location.reload();
  };

  const roleBtn = (r: Role, label: string) => (
    <button
      key={r}
      onClick={() => toggleRole(r)}
      className={`rounded-lg border px-2 py-1 text-xs ${
        roles[r] ? "border-slate-300 bg-slate-900 text-white" : "border-slate-300 bg-white hover:bg-slate-50"
      }`}
      aria-pressed={roles[r]}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-2 w-72 rounded-2xl border border-slate-300 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold">Dev Switches</div>
            <button className="rounded-md bg-slate-100 px-2 py-1 text-xs" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Signed in</span>
              <Switch checked={signedIn} onChange={setSignedIn} />
            </div>

            <div>
              <div className="mb-1 text-xs text-slate-600">Roles</div>
              <div className="flex flex-wrap gap-2">
                {roleBtn("student", "Student")}
                {roleBtn("staff", "Staff")}
                {roleBtn("admin", "Admin")}
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs text-slate-600">Workspace</div>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value as Role)}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button onClick={applyChanges} className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-sm text-white">
                Apply & Reload
              </button>
              <button onClick={resetGuest} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
                Guest
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm shadow-lg"
        aria-expanded={open}
      >
        ⚙️ Dev
      </button>
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 rounded-full border transition ${
        checked ? "border-slate-300 bg-slate-900" : "border-slate-300 bg-slate-200"
      }`}
      aria-pressed={checked}
      role="switch"
    >
      <span
        className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white transition ${
          checked ? "translate-x-[22px]" : ""
        }`}
      />
    </button>
  );
}
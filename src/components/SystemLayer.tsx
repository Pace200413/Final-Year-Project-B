"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { useTheme } from "next-themes";
import { getCookie, setCookie, deleteCookie } from "@/lib/client";

/* =============================================================================
   EmergencyBanner.tsx
============================================================================= */

type EmergencyBannerProps = {
  phone: string; // e.g. "082-260-607"
  context?: string; // e.g. "Security: 24/7"
  variant?: "default" | "smart"; // "smart" = frosted look
  showContext?: boolean; // allow hiding the chip to avoid duplication
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
      <div className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-sm ring-1 ring-black/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <span aria-hidden>🚨</span>
          <p className="flex-1 text-sm text-rose-900">
            Need urgent help? Call Campus Security{" "}
            <a className="underline font-semibold" href={tel}>
              {phone}
            </a>
            .
          </p>
          {showContext && (
            <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2.5 py-1 text-xs">
              <span className="inline-block size-1.5 rounded-full bg-current" /> {context}
            </span>
          )}
          <a
            href={tel}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white
                       bg-gradient-to-b from-rose-500 to-rose-600 shadow-sm ring-1 ring-rose-600/20
                       hover:from-rose-500 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition"
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
          <a className="underline font-semibold" href={tel}>
            {phone}
          </a>{" "}
          — available 24/7.
        </p>
        <a
          href={tel}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white
                     bg-gradient-to-b from-rose-500 to-rose-600 shadow-sm ring-1 ring-rose-600/20
                     hover:from-rose-500 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition"
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
   ServiceStatusBar.tsx  ✅ UPDATED: compact chips (not big cards)
============================================================================= */

export type StatusItem = {
  name: string;
  ok: boolean;
  href?: string;
  tip?: string; // optional label; default from ok
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

function isExternalUrl(href: string) {
  return /^https?:\/\//i.test(href);
}

export function ServiceStatusBar({ items = STATUS_ITEMS }: { items?: StatusItem[] }) {
  return (
    <section aria-label="Service status">
      <div className="grid grid-cols-2 gap-2">
        {items.map((it, idx) => {
          const statusText = it.tip ?? (it.ok ? "Operational" : "Degraded");
          const href = it.href;
          const external = !!href && (it.external || /^https?:\/\//i.test(href));

          const chip =
            "rounded-2xl px-3 py-2 bg-white/75 ring-1 ring-slate-200/70 " +
            "shadow-[0_10px_22px_rgba(15,23,42,.06)] supports-[backdrop-filter]:backdrop-blur-xl " +
            "transition hover:bg-white/90 hover:ring-slate-300 " +
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2";

          const content = (
            <div className="grid gap-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <Dot ok={it.ok} />
                <div className="min-w-0 text-[13px] font-semibold text-slate-900 leading-tight whitespace-normal">
                  {it.name}
                </div>
                {external ? (
                  <span className="ml-auto text-[11px] font-semibold text-slate-400" aria-hidden>
                    ↗
                  </span>
                ) : null}
              </div>

              <div className="pl-4 text-[11px] text-slate-500 leading-none truncate">
                {statusText}
              </div>
            </div>
          );

          if (!href) {
            return (
              <div key={`${it.name}-${idx}`} className={chip} aria-label={`${it.name} ${statusText}`}>
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
                className={chip}
                aria-label={`${it.name} ${statusText} (opens in new tab)`}
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={`${it.name}-${idx}`} href={href} className={chip} aria-label={`${it.name} ${statusText}`}>
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
   ThemeTransition.tsx
============================================================================= */

export function ThemeTransition() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      document.documentElement.style.transition = "background-color 0.3s ease, color 0.3s ease";
    }, 100);

    return () => clearTimeout(timer);
  }, [resolvedTheme]);

  return null;
}

/* =============================================================================
   AppearanceClient.tsx
============================================================================= */

type ThemePref = "system" | "light" | "dark";
type TextSize = "normal" | "large";
type Contrast = "normal" | "high";

function resolveTheme(pref: ThemePref): "light" | "dark" {
  if (pref === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref === "system" ? "light" : pref;
}

function apply(theme: "light" | "dark", text: TextSize, contrast: Contrast) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("a11y-text-large", text === "large");
  root.classList.toggle("a11y-contrast-high", contrast === "high");
}

function setThemeColorMeta(isDark: boolean) {
  let el = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.name = "theme-color";
    document.head.appendChild(el);
  }
  el.content = isDark ? "#0b1220" : "#ffffff";
}

export function AppearanceClient(props?: { themePref?: ThemePref; textSize?: TextSize; contrast?: Contrast }) {
  const { themePref, textSize, contrast } = props ?? {};

  useEffect(() => {
    const readAndApply = () => {
      const effectiveThemePref =
        themePref ??
        ((localStorage.getItem("profile_theme") as ThemePref) ??
          (localStorage.getItem("guest_theme") as ThemePref) ??
          "system");

      const effectiveText = (textSize ?? (localStorage.getItem("a11y_text") as TextSize) ?? "normal") as TextSize;
      const effectiveContrast =
        (contrast ?? (localStorage.getItem("a11y_contrast") as Contrast) ?? "normal") as Contrast;

      const resolved = resolveTheme(effectiveThemePref);
      apply(resolved, effectiveText, effectiveContrast);
      setThemeColorMeta(resolved === "dark");

      return { effectiveThemePref };
    };

    let { effectiveThemePref } = readAndApply();

    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (["profile_theme", "guest_theme", "a11y_text", "a11y_contrast"].includes(e.key)) {
        ({ effectiveThemePref } = readAndApply());
      }
    };
    window.addEventListener("storage", onStorage);

    const cleanups: Array<() => void> = [() => window.removeEventListener("storage", onStorage)];

    const attachMatchMedia = () => {
      if (effectiveThemePref !== "system") return;
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => readAndApply();
      mq.addEventListener?.("change", onChange);
      mq.addListener?.(onChange); // Safari < 14
      cleanups.push(() => {
        mq.removeEventListener?.("change", onChange);
        mq.removeListener?.(onChange);
      });
    };
    attachMatchMedia();

    return () => cleanups.forEach((fn) => fn());
  }, [themePref, textSize, contrast]);

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
        className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white transition ${checked ? "translate-x-[22px]" : ""}`}
      />
    </button>
  );
}
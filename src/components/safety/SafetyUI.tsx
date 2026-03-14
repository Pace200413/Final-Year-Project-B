"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const SAFETY_RED = "#E31B23";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Normalize phone text into a safe value for tel: links */
export function normalizeTel(phone: string) {
  return (phone || "").replace(/[^0-9+]/g, "");
}

export function toTelHref(phone: string) {
  return `tel:${normalizeTel(phone)}`;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2";

type Tone = "red" | "dark" | "light";

type StripItem = {
  label: string;
  href: string;
  icon: ReactNode;
  tone?: Tone;
  ariaLabel?: string;
};

type SmartLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;

export function SmartLink({ href, className, children, ...rest }: SmartLinkProps) {
  const isExternal =
    href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http");

  // Safer external behavior for http(s)
  const isHttp = href.startsWith("http");
  const target = isHttp ? rest.target ?? "_blank" : rest.target;
  const rel = isHttp ? rest.rel ?? "noopener noreferrer" : rest.rel;

  if (isExternal) {
    return (
      <a href={href} className={className} target={target} rel={rel} {...rest}>
        {children}
      </a>
    );
  }

  // Next Link can accept most anchor props (like aria-*, onClick)
  return (
    <Link href={href} className={className} {...(rest as any)}>
      {children}
    </Link>
  );
}

export function SafetyPageShell({
  strip,
  children,
}: {
  strip?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#F7F8FA] text-slate-900",
        // extra bottom padding for mobile + safe area
        "pb-[calc(96px+env(safe-area-inset-bottom))]"
      )}
    >
      {strip}
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">{children}</div>
    </div>
  );
}

/**
 * Sticky actions strip (mobile-first)
 * Default top=0 so it works best on mobile; you can override with topClassName if you have a fixed header.
 */
export function EmergencyStrip({
  items,
  topClassName = "top-0",
  ariaLabel = "Quick actions",
}: {
  items: StripItem[];
  topClassName?: string;
  ariaLabel?: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "sticky z-20 border-b border-slate-200 bg-white/95 backdrop-blur",
        topClassName
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className={cn("grid gap-2", items.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {items.map((item, idx) => {
            const tone = item.tone ?? "light";

            const toneClass =
              tone === "red"
                ? "bg-[var(--safety-red)] text-white shadow-sm"
                : tone === "dark"
                ? "bg-slate-900 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-800 shadow-sm";

            return (
              <SmartLink
                key={`${item.label}-${idx}`}
                href={item.href}
                aria-label={item.ariaLabel ?? item.label}
                className={cn(
                  "inline-flex min-w-0 flex-col items-center justify-center rounded-2xl px-3 py-3 text-center",
                  "transition active:scale-[0.99]",
                  "min-h-[56px]", // bigger tap target for mobile
                  FOCUS_RING,
                  toneClass
                )}
                style={{ ["--safety-red" as any]: SAFETY_RED }}
              >
                <span className="mb-1 text-base leading-none">{item.icon}</span>
                <span className="truncate text-[11px] font-semibold leading-none">{item.label}</span>
              </SmartLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

type SafetyCardProps = ComponentPropsWithoutRef<"section"> & {
  children: ReactNode;
};

export function SafetyCard({ children, className, ...props }: SafetyCardProps) {
  return (
    <section
      {...props}
      className={cn("rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm", className)}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-100">
      {children}
    </div>
  );
}

export function PageTitleBlock({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <>
      {eyebrow ? <div>{eyebrow}</div> : null}
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </>
  );
}

export function InlineAlert({
  children,
  tone = "red",
  role,
}: {
  children: ReactNode;
  tone?: "red" | "amber";
  role?: "alert" | "status";
}) {
  const toneClass =
    tone === "red"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-amber-200 bg-amber-50 text-amber-800";

  const dotClass = tone === "red" ? "bg-red-600" : "bg-amber-600";

  return (
    <div role={role ?? (tone === "red" ? "alert" : "status")} className={cn("flex items-start gap-3 rounded-2xl border p-4", toneClass)}>
      <div className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", dotClass)} />
      <div className="text-sm leading-6">{children}</div>
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      {subtitle ? <p className="mt-1.5 text-sm leading-6 text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

export function ActionLinkCard({
  href,
  icon,
  title,
  description,
  className,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <SmartLink
      href={href}
      className={cn(
        "block rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm",
        "transition active:scale-[0.995]",
        "hover:border-red-200 hover:shadow-md",
        FOCUS_RING,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-lg"
            style={{ color: SAFETY_RED }}
          >
            {icon}
          </div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
      </div>
    </SmartLink>
  );
}

export function InfoRow({
  title,
  text,
  right,
}: {
  title: string;
  text: string;
  right?: ReactNode;
}) {
  return (
    <div className="px-5 py-4">
      <div className="min-w-0 max-w-2xl">
        <h3 className="text-[15px] font-semibold tracking-tight text-slate-900 sm:text-base">
          {title}
        </h3>

        <p className="mt-2 text-[15px] leading-7 text-slate-600">
          {text}
        </p>

        {right ? <div className="mt-4">{right}</div> : null}
      </div>
    </div>
  );
}

export function NumberStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 px-5 py-4">
      <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
        {number}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

export function MiniAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <SmartLink
      href={href}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700 shadow-sm",
        "min-h-[64px]",
        FOCUS_RING,
        "active:scale-[0.99] transition"
      )}
    >
      <div className="mb-1 text-base text-slate-500">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </SmartLink>
  );
}
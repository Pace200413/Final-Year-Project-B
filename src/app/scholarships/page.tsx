"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  GraduationCap,
  Landmark,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import {
  CMS_PAGE_CONFIG,
  type ScholarshipsContent,
} from "@/lib/page-cms";

const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 sm:px-6";

type FundingItem = {
  title: string;
  href: string;
  image: string;
  alt: string;
  tag: string;
  description: string;
};

const FALLBACK_CONTENT: ScholarshipsContent =
  CMS_PAGE_CONFIG.scholarships.defaultContent;

type Meta = {
  icon: LucideIcon;
  pillClass: string;
};

function getMeta(tag: string): Meta {
  switch (tag) {
    case "Foundation":
      return {
        icon: GraduationCap,
        pillClass: "border-rose-200/80 bg-rose-50/95 text-rose-700",
      };
    case "Diploma":
      return {
        icon: GraduationCap,
        pillClass: "border-sky-200/80 bg-sky-50/95 text-sky-700",
      };
    case "Undergraduate":
      return {
        icon: Landmark,
        pillClass: "border-indigo-200/80 bg-indigo-50/95 text-indigo-700",
      };
    case "Postgraduate":
      return {
        icon: GraduationCap,
        pillClass: "border-violet-200/80 bg-violet-50/95 text-violet-700",
      };
    case "Payment plan":
      return {
        icon: WalletCards,
        pillClass: "border-amber-200/80 bg-amber-50/95 text-amber-700",
      };
    default:
      return {
        icon: CreditCard,
        pillClass: "border-slate-200 bg-white/90 text-slate-700",
      };
  }
}

function BackgroundDecor() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(58%_34%_at_0%_0%,rgba(212,42,48,.09),transparent_60%),radial-gradient(36%_24%_at_100%_4%,rgba(15,23,42,.05),transparent_56%),linear-gradient(180deg,#f8fafc_0%,#f4f6fb_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[240px] [background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,0))]"
      />
    </>
  );
}

function Hero({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <section className={`${CONTAINER} pt-3 sm:pt-4`}>
      <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="transition hover:text-slate-800">
          Home
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-slate-800">Funding</span>
      </nav>

      <div className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_12px_28px_rgba(15,23,42,.05)]">
        <div
          aria-hidden
          className="absolute inset-0 [background:radial-gradient(circle_at_top_left,rgba(212,42,48,.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.98))]"
        />

        <div className="relative flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold tracking-tight text-slate-900 sm:text-[28px]">
              {title}
            </h1>
            <p className="mt-1 text-[13.5px] leading-5 text-slate-600 sm:text-[14px]">
              {subtitle}
            </p>
          </div>

          <div className="shrink-0 rounded-full border border-[#D42A30]/15 bg-[#D42A30]/6 px-3 py-1 text-[11px] font-semibold text-[#B0171E]">
            {count} links
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="mb-3">
      <h2 className="text-[18px] font-semibold tracking-tight text-slate-900 sm:text-[20px]">
        Quick access
      </h2>
    </div>
  );
}

function FundingCard({
  item,
  index,
}: {
  item: FundingItem;
  index: number;
}) {
  const meta = getMeta(item.tag);
  const Icon = meta.icon;
  const isPayment = item.tag === "Payment plan";

  return (
    <Link
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "group relative isolate overflow-hidden rounded-[26px] border border-slate-200/80 bg-white",
        "shadow-[0_14px_34px_rgba(15,23,42,.055)] transition duration-300",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_20px_48px_rgba(15,23,42,.10)]",
        isPayment ? "md:col-span-2 xl:col-span-3" : "",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="absolute -left-1/3 top-0 z-10 h-full w-1/3 -skew-x-12 bg-white/20 opacity-0 blur-xl transition duration-700 group-hover:translate-x-[420%] group-hover:opacity-100"
      />

      <div
        className={[
          "relative overflow-hidden bg-slate-100",
          isPayment ? "aspect-[16/8]" : "aspect-[16/10]",
        ].join(" ")}
      >
        <Image
          src={item.image}
          alt={item.alt}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />

        <div
          aria-hidden
          className={[
            "absolute inset-0",
            isPayment
              ? "bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent"
              : "bg-gradient-to-t from-slate-950/60 via-slate-900/12 to-transparent",
          ].join(" ")}
        />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.08em] backdrop-blur ${meta.pillClass}`}
          >
            {item.tag}
          </span>
        </div>

        <div className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl border border-white/25 bg-white/15 text-white backdrop-blur-md">
          <Icon className="h-[18px] w-[18px]" />
        </div>

        <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md">
          <span className="font-semibold">{String(index + 1).padStart(2, "0")}</span>
          <span className="h-1 w-1 rounded-full bg-white/70" aria-hidden />
          <span>Official page</span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <h3
            className={[
              "font-semibold leading-tight tracking-tight text-slate-900",
              isPayment ? "text-[23px] sm:text-[27px]" : "text-[19px] sm:text-[22px]",
            ].join(" ")}
          >
            {item.title}
          </h3>

          <span className="mt-0.5 shrink-0 rounded-full bg-slate-100 p-2 text-slate-500 transition group-hover:bg-[#D42A30]/8 group-hover:text-[#D42A30]">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <p
          className={[
            "mt-2.5 text-[13.5px] leading-6 text-slate-600",
            isPayment ? "max-w-3xl" : "",
          ].join(" ")}
        >
          {item.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#D42A30]">
            <span>Open resource</span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </div>

          <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 sm:inline-flex">
            Swinburne verified
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ScholarshipsPage() {
  const [cms, setCms] = useState<ScholarshipsContent>(FALLBACK_CONTENT);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch("/api/cms/scholarships", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!alive) return;
        setCms((json?.content ?? FALLBACK_CONTENT) as ScholarshipsContent);
      } catch {}
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const items = cms.items ?? FALLBACK_CONTENT.items;

  return (
    <div className="relative min-h-screen overflow-hidden pb-28">
      <BackgroundDecor />
      <Hero
        title={cms.hero.title}
        subtitle={cms.hero.subtitle}
        count={items.length}
      />

      <section className={`${CONTAINER} relative mt-3 sm:mt-4`}>
        <SectionHeader />

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <FundingCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
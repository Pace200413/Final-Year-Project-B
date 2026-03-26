import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CreditCard,
  FileCheck2,
  Globe2,
  GraduationCap,
  Info,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import {
  STUDENT_ESSENTIALS,
  type StudentEssentialItem,
} from "@/data/student-essentials";

const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 sm:px-6";

type Meta = {
  category: string;
  summary: string;
  icon: LucideIcon;
  chipClass: string;
};

function getMeta(title: string): Meta {
  switch (title) {
    case "Student Information":
      return {
        category: "Information",
        summary:
          "Important student-facing information, official guidance, and key academic details.",
        icon: Info,
        chipClass: "border-slate-200/80 bg-white/90 text-slate-700",
      };
    case "International Student Services":
      return {
        category: "International",
        summary:
          "Support, services, and essential guidance designed for international students.",
        icon: Globe2,
        chipClass: "border-sky-200/80 bg-sky-50/95 text-sky-700",
      };
    case "Managing Your Enrolment":
      return {
        category: "Enrolment",
        summary:
          "Manage enrolment matters, study load decisions, and related academic processes.",
        icon: FileCheck2,
        chipClass: "border-violet-200/80 bg-violet-50/95 text-violet-700",
      };
    case "Safer Community":
      return {
        category: "Safety",
        summary:
          "Official resources and safety guidance to support a safer campus community.",
        icon: ShieldCheck,
        chipClass: "border-emerald-200/80 bg-emerald-50/95 text-emerald-700",
      };
    case "Paying Your Fees":
      return {
        category: "Finance",
        summary:
          "Fee payment options, important payment information, and related student finance guidance.",
        icon: CreditCard,
        chipClass: "border-amber-200/80 bg-amber-50/95 text-amber-700",
      };
    case "Exams, Results and Student Progression":
      return {
        category: "Assessment",
        summary:
          "Exam information, assessment results, progression updates, and academic milestones.",
        icon: BookOpen,
        chipClass: "border-rose-200/80 bg-rose-50/95 text-rose-700",
      };
    case "Graduation and Course Completion":
      return {
        category: "Graduation",
        summary:
          "Graduation requirements, course completion steps, and official completion updates.",
        icon: GraduationCap,
        chipClass: "border-indigo-200/80 bg-indigo-50/95 text-indigo-700",
      };
    default:
      return {
        category: "Resource",
        summary: "Official student resource.",
        icon: BadgeCheck,
        chipClass: "border-slate-200/80 bg-white/90 text-slate-700",
      };
  }
}

function BackgroundDecor() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
        [background:
          radial-gradient(60%_35%_at_0%_0%,rgba(212,42,48,.10),transparent_60%),
          radial-gradient(38%_28%_at_100%_8%,rgba(15,23,42,.06),transparent_55%),
          linear-gradient(180deg,#f8fafc_0%,#f5f7fb_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[320px]
        [background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(255,255,255,0))]"
      />
    </>
  );
}

function InfoPill({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/92 px-3 py-2 text-[12.5px] font-medium text-slate-600 shadow-sm backdrop-blur">
      <Icon className="h-4 w-4 text-[#D42A30]" />
      <span>{label}</span>
    </div>
  );
}

function Hero() {
  return (
    <section className={`${CONTAINER} pt-3 sm:pt-5`}>
      <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="transition hover:text-slate-800">
          Home
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-slate-800">Student Essentials</span>
      </nav>

      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,.05)]">
        <div
          aria-hidden
          className="absolute inset-0
          [background:
            radial-gradient(circle_at_top_left,rgba(212,42,48,.07),transparent_28%),
            linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,250,252,.98))]"
        />

        <div className="relative px-4 py-4 sm:px-6 sm:py-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D42A30]/15 bg-[#D42A30]/6 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.10em] text-[#B0171E]">
            <Sparkles className="h-3.5 w-3.5" />
            Official student hub
          </div>

          <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[34px]">
            Student Essentials
          </h1>

          <p className="mt-2 max-w-3xl text-[14px] leading-6 text-slate-600 sm:text-[15px]">
            Official Swinburne resources for student information, enrolment, fees,
            exams, safety, international support, and graduation.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[12.5px] font-medium text-slate-600">
            <BadgeCheck className="h-4 w-4 text-[#D42A30]" />
            Verified official links
          </div>
        </div>
      </div>
    </section>
  );
}

function EssentialsCard({
  item,
  index,
}: {
  item: StudentEssentialItem;
  index: number;
}) {
  const meta = getMeta(item.title);
  const Icon = meta.icon;
  const featured = index === 0;

  return (
    <Link
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "group relative isolate overflow-hidden rounded-[30px] border border-slate-200/80 bg-white",
        "shadow-[0_16px_42px_rgba(15,23,42,.06)] transition duration-300",
        "hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_60px_rgba(15,23,42,.12)]",
        featured ? "md:col-span-2" : "",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="absolute -left-1/3 top-0 z-10 h-full w-1/3 -skew-x-12 bg-white/20 opacity-0 blur-xl transition duration-700 group-hover:translate-x-[420%] group-hover:opacity-100"
      />

      <div
        className={[
          "relative overflow-hidden bg-slate-100",
          featured ? "aspect-[18/9]" : "aspect-[16/10]",
        ].join(" ")}
      >
        <Image
          src={item.image}
          alt={item.alt}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-900/10 to-transparent"
        />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.08em] backdrop-blur ${meta.chipClass}`}
          >
            {meta.category}
          </span>
        </div>

        <div className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl border border-white/30 bg-white/15 text-white backdrop-blur-md">
          <Icon className="h-[18px] w-[18px]" />
        </div>

        <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md">
          <span className="font-semibold">{String(index + 1).padStart(2, "0")}</span>
          <span className="h-1 w-1 rounded-full bg-white/70" aria-hidden />
          <span>Official resource</span>
        </div>
      </div>

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2
            className={[
              "font-semibold leading-tight tracking-tight text-slate-900",
              featured ? "text-[28px] sm:text-[34px]" : "text-[24px] sm:text-[28px]",
            ].join(" ")}
          >
            {item.title}
          </h2>

          <span className="mt-1 shrink-0 rounded-full bg-slate-100 p-2 text-slate-500 transition group-hover:bg-[#D42A30]/8 group-hover:text-[#D42A30]">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <p
          className={[
            "mt-3 leading-6 text-slate-600",
            featured ? "max-w-2xl text-[15px]" : "text-[14px]",
          ].join(" ")}
        >
          {meta.summary}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#D42A30]">
            <span>Open official page</span>
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 sm:inline-flex">
            Swinburne verified
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function StudentEssentialsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden pb-28">
      <BackgroundDecor />
      <Hero />

      <section className={`${CONTAINER} relative mt-4 sm:mt-5`}>
        <div className="mb-4 flex items-center justify-between gap-3">
        <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Quick access
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Official student resources
            </h2>
        </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {STUDENT_ESSENTIALS.map((item: StudentEssentialItem, index: number) => (
            <EssentialsCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
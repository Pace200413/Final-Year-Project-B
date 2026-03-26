import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Sparkles,
  Wifi,
} from "lucide-react";

type CardItem = {
  title: string;
  href: string;
  image: string;
  alt: string;
  description: string;
  tag: string;
  icon: ReactNode;
};

type StepItem = {
  title: string;
  subtitle: string;
  icon: ReactNode;
};

const topCards: CardItem[] = [
  {
    title: "O-Week",
    href: "https://www.swinburne.edu.my/current-students/get-started/o-week/",
    image: "/images/new-to-swinburne/o-week.jpg",
    alt: "O-Week",
    description: "Orientation activities, first-week information, and campus life.",
    tag: "Get started",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    title: "Checklist",
    href: "https://www.swinburne.edu.my/current-students/get-started/enrolment-for-new-students/",
    image: "/images/new-to-swinburne/checklist.jpg",
    alt: "Checklist for new students",
    description: "Important enrolment and onboarding steps for new students.",
    tag: "Important",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    title: "Program Study Planner",
    href: "https://www.swinburne.edu.my/current-students/get-started/program-study-planner/",
    image: "/images/new-to-swinburne/program-study-planner.jpg",
    alt: "Program study planner",
    description: "Plan your subjects and understand your study path better.",
    tag: "Planning",
    icon: <BookOpen className="h-4 w-4" />,
  },
];

const bottomCards: CardItem[] = [
  {
    title: "Wifi, Library and Systems",
    href: "https://www.swinburne.edu.my/current-students/get-started/access-wi-fi-library-systems/",
    image: "/images/new-to-swinburne/wifi-library-systems.jpg",
    alt: "Wifi, library and systems",
    description: "Access wifi, library resources, and student systems.",
    tag: "Campus access",
    icon: <Wifi className="h-4 w-4" />,
  },
  {
    title: "Student Guides",
    href: "https://www.swinburne.edu.my/current-students/get-started/student-guides/",
    image: "/images/new-to-swinburne/student-guides.jpg",
    alt: "Student guides",
    description: "Official guides for student processes and campus support.",
    tag: "Guides",
    icon: <FileText className="h-4 w-4" />,
  },
];

const recommendedSteps: StepItem[] = [
  {
    title: "Checklist",
    subtitle: "Complete the main setup steps first.",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    title: "O-Week",
    subtitle: "Explore orientation and campus life.",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    title: "Wifi & Library",
    subtitle: "Set up your key student systems.",
    icon: <Wifi className="h-4 w-4" />,
  },
  {
    title: "Study Planner",
    subtitle: "Understand your subject pathway.",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "Student Guides",
    subtitle: "Use official help and process guides.",
    icon: <FileText className="h-4 w-4" />,
  },
];

function MobileShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-4 sm:px-6 sm:pt-5">
        {children}
      </div>
    </main>
  );
}

function CompactHero() {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.07)]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,42,48,0.10),transparent_24%)]"
      />

      <div className="relative p-3.5 sm:p-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#D42A30]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B91C1C]">
          <Sparkles className="h-3 w-3" />
          Start here
        </div>

        <div className="mt-2.5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[1.45rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[1.8rem]">
              New to Swinburne
            </h1>

            <p className="mt-1 text-[13px] leading-5 text-slate-600 sm:text-sm">
              Main official links new students usually need first.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="https://www.swinburne.edu.my/current-students/get-started/enrolment-for-new-students/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D42A30] px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(212,42,48,0.22)] transition hover:bg-[#be1f25]"
            >
              Checklist
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            <a
              href="https://www.swinburne.edu.my/current-students/get-started/o-week/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              O-Week
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CurvedConnector() {
  return (
    <div className="flex shrink-0 items-center justify-center px-1.5">
      <svg
        width="34"
        height="28"
        viewBox="0 0 34 28"
        fill="none"
        aria-hidden
        className="overflow-visible"
      >
        <path
          d="M3 22C8 7 20 6 28 13"
          stroke="#CBD5E1"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M23.5 8.5L29 13L23 17.5"
          stroke="#CBD5E1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function RecommendedFlow() {
  return (
    <section className="mt-5 rounded-[22px] border border-slate-200 bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="inline-flex h-7 w-7 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Best order to follow</h2>
          <p className="text-[11px] text-slate-500">Tiny flow for getting started</p>
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-max items-center">
          {recommendedSteps.map((step, index) => {
            const styles =
              index === 0
                ? {
                    wrap: "bg-rose-50 border-rose-200 rotate-[-2deg]",
                    chip: "bg-rose-100 text-rose-700",
                  }
                : index === 1
                ? {
                    wrap: "bg-amber-50 border-amber-200 rotate-[1.5deg]",
                    chip: "bg-amber-100 text-amber-700",
                  }
                : index === 2
                ? {
                    wrap: "bg-sky-50 border-sky-200 rotate-[-1.5deg]",
                    chip: "bg-sky-100 text-sky-700",
                  }
                : index === 3
                ? {
                    wrap: "bg-violet-50 border-violet-200 rotate-[1deg]",
                    chip: "bg-violet-100 text-violet-700",
                  }
                : {
                    wrap: "bg-emerald-50 border-emerald-200 rotate-[-1deg]",
                    chip: "bg-emerald-100 text-emerald-700",
                  };

            return (
              <div key={step.title} className="flex items-center">
                <div
                  className={`relative min-w-[148px] rounded-[18px] border p-3 shadow-[0_8px_18px_rgba(15,23,42,0.06)] ${styles.wrap}`}
                >
                  <div className="absolute left-1/2 top-0 h-2.5 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-sm" />

                  <div className="flex items-start gap-2.5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${styles.chip}`}>
                          {step.icon}
                        </div>
                        <div className="text-xs font-semibold leading-none text-slate-900">
                          {step.title}
                        </div>
                      </div>

                      <p className="mt-1.5 text-[10px] leading-4 text-slate-600">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {index !== recommendedSteps.length - 1 ? <CurvedConnector /> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h2>
    </div>
  );
}

function ResourceCard({ item }: { item: CardItem }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.11)]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={item.image}
          alt={item.alt}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        <div className="absolute left-3 top-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm">
            {item.icon}
            <span>{item.tag}</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-tight tracking-tight text-slate-900 sm:text-xl">
            {item.title}
          </h3>

          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#D42A30]/10 text-[#D42A30] transition group-hover:bg-[#D42A30] group-hover:text-white">
            <ArrowUpRight className="h-4.5 w-4.5" />
          </div>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>

        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#D42A30]">
          <span>Learn more</span>
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </a>
  );
}


export default function NewToSwinburnePage() {
  return (
    <MobileShell>
      <CompactHero />

      <section className="mt-6">
        <SectionHeader title="Main links" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topCards.map((item) => (
            <ResourceCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <RecommendedFlow />

      <section className="mt-6">
        <SectionHeader title="Campus systems & guides" />
        <div className="grid gap-4 md:grid-cols-2">
          {bottomCards.map((item) => (
            <ResourceCard key={item.title} item={item} />
          ))}
        </div>
      </section>
    </MobileShell>
  );
}
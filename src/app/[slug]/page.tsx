import Link from "next/link";
import { notFound } from "next/navigation";

const PAGES: Record<string, { title: string; desc: string }> = {
  timetable:   { title: "Timetable",               desc: "View your weekly class schedule and room locations." },
  results:     { title: "Results / Grades",        desc: "Check unit results, grade breakdowns, and GPA." },
  fees:        { title: "Fees & payments",         desc: "See outstanding balances and make payments." },
  enrollments: { title: "Enrollments",             desc: "Add / drop classes and review your study plan." },
  attendance:  { title: "Attendance",              desc: "Track attendance and view class participation." },
  advising:    { title: "Advising / appointments", desc: "Book time with an academic advisor." },
  library:     { title: "Library",                 desc: "Search resources and manage your loans." },
  support:     { title: "Help center",             desc: "FAQs, contact options, and issue reporting." },
  privacy:     { title: "Privacy policy",          desc: "How we collect, use, and protect your data." },
  terms:       { title: "Terms of use",            desc: "App usage terms and acceptable use policy." },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug.toLowerCase()] || { title: "Page", desc: "" };
  return { title: `${page.title} — Swinburne App`, description: page.desc };
}

export default async function Subpage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug.toLowerCase()];
  if (!page) notFound();

  return (
    <main className="maxw container-px my-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <header className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">{page.title}</h1>
            <p className="text-sm text-slate-600">{page.desc}</p>
          </div>
          <Link
            href="/profile"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            ← Back to Profile
          </Link>
        </header>

        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            This is a placeholder for <strong>{page.title}</strong>. Swap in the real module when ready.
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              Primary action
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              Secondary action
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

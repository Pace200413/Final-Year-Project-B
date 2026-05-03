"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import {
  CMS_PAGE_CONFIG,
  type StudentEssentialsContent,
} from "@/lib/page-cms";

const FALLBACK_CONTENT: StudentEssentialsContent =
  CMS_PAGE_CONFIG["student-essentials"].defaultContent;

export default function StudentEssentialsPage() {
  const [cms, setCms] = useState<StudentEssentialsContent>(FALLBACK_CONTENT);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch("/api/cms/student-essentials", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!alive) return;
        setCms((json?.content ?? FALLBACK_CONTENT) as StudentEssentialsContent);
      } catch {}
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const items = cms.items ?? FALLBACK_CONTENT.items;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-4 sm:px-6">
        <section className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.07)]">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,42,48,0.10),transparent_24%)]"
          />
          <div className="relative p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#D42A30]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B91C1C]">
              <GraduationCap className="h-3.5 w-3.5" />
              Student resources
            </div>

            <h1 className="mt-3 text-[1.8rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[2.1rem]">
              Student Essentials
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Main official links students commonly need during the semester.
            </p>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Quick access
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <a
                key={item.title}
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

                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#D42A30]">
                    <span>Open resource</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
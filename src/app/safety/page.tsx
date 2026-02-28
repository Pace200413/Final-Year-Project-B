// src/app/safety/page.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import type React from "react";
import { motion } from "framer-motion";
import {
  FaFireExtinguisher, FaUserShield, FaFirstAid, FaFlask, FaCloudSunRain,
  FaInfoCircle, FaHandsHelping, FaClinicMedical, FaLaptop, FaEnvelope,
  FaBoxOpen, FaBusAlt, FaMapMarkerAlt, FaMoon, FaPhoneAlt, FaComments
} from "react-icons/fa";
import Link from "next/link";

type SafetySection = {
  id: string; group: string; title: string; text: string;
  link?: string; linkLabel?: string;
};
type SafetyData = {
  emergencyNumber: string; securityNumber: string;
  itHelpEmail: string; reportUrl: string; sections: SafetySection[];
};

const FALLBACK: SafetyData = {
  emergencyNumber: "999",
  securityNumber: "082260607",
  itHelpEmail: "helpdesk@swin.edu.my",
  reportUrl: "/support",
  sections: [],
};

// small helper to fix mojibake like "8:30â€“17:00"
function clean(s: string) {
  return (s || "")
    .replace(/â€“/g, "–")
    .replace(/â€”/g, "—")
    .replace(/Â/g, "");
}

const ICONS: Record<string, React.ReactElement> = {
  "fire-safety": <FaFireExtinguisher className="text-gray-500" />,
  "personal-safety": <FaUserShield className="text-gray-500" />,
  medical: <FaFirstAid className="text-gray-500" />,
  labs: <FaFlask className="text-gray-500" />,
  weather: <FaCloudSunRain className="text-gray-500" />,
  "info-counter": <FaInfoCircle className="text-gray-500" />,
  "student-support": <FaHandsHelping className="text-gray-500" />,
  "lost-found": <FaBoxOpen className="text-gray-500" />,
  clinic: <FaClinicMedical className="text-gray-500" />,
  counselling: <FaHandsHelping className="text-gray-500" />,
  shuttle: <FaBusAlt className="text-gray-500" />,
  parking: <FaMapMarkerAlt className="text-gray-500" />,
  escort: <FaMoon className="text-gray-500" />,
};

export default function SafetyPage() {
  const [data, setData] = useState<SafetyData>(FALLBACK);

  useEffect(() => {
    fetch("/api/safety", { cache: "no-store" })
      .then((r) => r.json())
      .then((json: SafetyData) => {
        // clean any mojibake in sections on the fly
        const sections = Array.isArray(json.sections) ? json.sections.map(s => ({
          ...s,
          title: clean(s.title),
          text: clean(s.text),
          linkLabel: clean(s.linkLabel || ""),
          group: clean(s.group || "Other"),
        })) : [];
        setData({
          emergencyNumber: json.emergencyNumber || FALLBACK.emergencyNumber,
          securityNumber: json.securityNumber || FALLBACK.securityNumber,
          itHelpEmail: json.itHelpEmail || FALLBACK.itHelpEmail,
          reportUrl: json.reportUrl || FALLBACK.reportUrl,
          sections,
        });
      })
      .catch(() => { /* keep FALLBACK */ });
  }, []);

  const groups = Array.from(new Set((data.sections ?? []).map(s => s.group || "Other")));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex gap-3">
          <a href={`tel:${data.emergencyNumber}`}
             className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-3 bg-[#EF4444] text-white font-semibold shadow-sm hover:bg-red-600">
            <FaPhoneAlt className="mr-2" /> Emergency {data.emergencyNumber}
          </a>
          <Link href="/exit-navigation"
                className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-3 bg-gray-900 text-white font-semibold shadow-sm hover:bg-black">
            Go to Exit Navigation
          </Link>
        </div>
      </div>

      {/* Title */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                   className="text-2xl font-semibold text-gray-900">
          Staying Safe on Campus
        </motion.h1>
        <p className="text-gray-600 text-sm">Practical guidance for students, staff, and visitors.</p>
      </div>

      {/* Quick links */}
      <div className="max-w-6xl mx-auto px-6 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <SmartQuickLink icon={<FaPhoneAlt />} label="Security" href={`tel:${data.securityNumber}`} />
        <SmartQuickLink icon={<FaLaptop />} label="IT Help" href={`mailto:${data.itHelpEmail}`} />
        <SmartQuickLink icon={<FaEnvelope />} label="Report" href={data.reportUrl} />
      </div>

      {/* Sections */}
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        {groups.map((group) => (
          <div key={group}>
            <SectionTitle title={group} />
            {data.sections
              .filter((s) => (s.group || "Other") === group)
              .map((s) => (
                <SafetyCard key={s.id}
                  icon={ICONS[s.id] ?? <FaInfoCircle className="text-gray-500" />}
                  title={s.title} text={s.text}
                  link={s.link} linkLabel={s.linkLabel}
                />
              ))}
          </div>
        ))}

        {/* Feedback */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
          <FaComments className="text-gray-500 w-6 h-6 mx-auto mb-3" />
          <h2 className="font-semibold text-gray-800 mb-2">We value your feedback</h2>
          <p className="text-sm text-gray-600 mb-4">Have a concern, suggestion, or safety issue? Let us know.</p>
          <SmartLink href={data.reportUrl}
                     className="inline-block bg-[#EF4444] text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-red-600">
            Go to Support / Report
          </SmartLink>
        </div>
      </div>
    </div>
  );
}

function SafetyCard({ icon, title, text, link, linkLabel }:{
  icon: ReactNode; title: string; text: string; link?: string; linkLabel?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-lg">{icon}</div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <p className="text-sm text-gray-700 mb-3">{text}</p>
      {link && <SmartLink href={link} className="text-[#EF4444] text-sm font-medium hover:underline">
        {linkLabel ?? "Learn more"}
      </SmartLink>}
    </div>
  );
}
function SectionTitle({ title }:{ title: string }) {
  return <h3 className="text-lg font-semibold text-gray-800 pt-6 pb-1 border-b border-gray-100">{title}</h3>;
}
function SmartLink({ href, className, children }:{ href: string; className?: string; children: ReactNode; }) {
  const isExternal = href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http");
  return isExternal ? <a href={href} className={className}>{children}</a>
                    : <Link href={href} className={className}>{children}</Link>;
}
function SmartQuickLink({ icon, label, href }:{ icon: ReactNode; label: string; href: string; }) {
  const isExternal = href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http");
  const cls = "flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-4 text-gray-700";
  return isExternal ? (
    <a href={href} className={cls}><div className="text-gray-500 text-lg mb-1">{icon}</div><span className="text-sm font-medium">{label}</span></a>
  ) : (
    <Link href={href} className={cls}><div className="text-gray-500 text-lg mb-1">{icon}</div><span className="text-sm font-medium">{label}</span></Link>
  );
}

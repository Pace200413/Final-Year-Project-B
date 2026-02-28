// src/app/emergency/security-contact/page.tsx
"use client";

import { motion } from "framer-motion";
import { FaShieldAlt, FaMapMarkedAlt, FaPhoneAlt, FaArrowRight, FaExclamationCircle } from "react-icons/fa";
import { MdEmergency } from "react-icons/md";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SecuritySettings = {
  emergencyLabel: string; emergencyTel: string;
  exitNavLabel: string;  exitNavUrl: string;
  title: string; subtitle: string; alertText: string;
  exitGuide: { locationText: string; nearestExitText: string; linkText: string; linkHref: string };
  contacts: { name: string; phone: string }[];
  bottomCards: { title: string; description: string; href: string; linkText?: string }[];
};

const API = "/api/admin/security-settings"; // ← match your actual route

export default function SecurityContactPage() {
  const FALLBACK: SecuritySettings = {
    emergencyLabel: "Emergency 999",
    emergencyTel: "999",
    exitNavLabel: "Exit Navigation",
    exitNavUrl: "/exit-navigation",
    title: "Security & Emergency",
    subtitle: "Campus emergency resources, contacts, and guidance.",
    alertText: "Stay calm during emergencies. Follow instructions from campus security and use the nearest safe exit.",
    exitGuide: { locationText: "Your location will appear here.", nearestExitText: "Nearest exit will be suggested automatically.", linkText: "Open Exit Navigation →", linkHref: "/exit-navigation" },
    contacts: [{ name: "Campus Security", phone: "082260607" }, { name: "Emergency Services", phone: "999" }, { name: "Health Clinic", phone: "082260620" }],
    bottomCards: [
      { title: "Safety Protocols", description: "Know what to do in fire, medical, and personal safety situations.", href: "/safety", linkText: "View protocols" },
      { title: "Exit Navigation",  description: "Find the nearest exit and view status in real time.", href: "/exit-navigation", linkText: "Open navigation" },
    ],
  };

  const [s, setS] = useState<SecuritySettings>(FALLBACK);
  const [err, setErr] = useState<string | null>(null);

  const bcRef = useRef<BroadcastChannel | null>(null);

  const load = async () => {
    try {
      const r = await fetch(API, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setS({ ...FALLBACK, ...(j.settings ?? j) });
      setErr(null);
    } catch (e: any) {
      setErr(e.message ?? String(e));
      setS(FALLBACK);
    }
  };

  useEffect(() => {
    load();

    // live updates via BroadcastChannel
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("security-settings");
      bcRef.current.onmessage = (msg) => {
        if (msg?.data?.type === "updated") load();
      };
    }

    // fallback: storage event (cross-tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "security-settings:updated") load();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      try { bcRef.current?.close(); } catch {}
      window.removeEventListener("storage", onStorage);
    };
  }, []);


if (err) return <div className="p-6 text-red-600">Failed to load settings: {err}</div>;
if (!s)  return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-28">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex gap-3">
          <a
            href={`tel:${s.emergencyTel}`}
            className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-3 bg-[#EF4444] text-white font-semibold shadow-sm hover:bg-red-600"
          >
            <FaPhoneAlt className="mr-2" /> {s.emergencyLabel}
          </a>
          <Link
            href={s.exitNavUrl}
            className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-3 bg-gray-900 text-white font-semibold shadow-sm hover:bg-black"
          >
            {s.exitNavLabel}
          </Link>
        </div>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900">{s.title}</h1>
        <p className="text-gray-600 text-sm mt-1.5">{s.subtitle}</p>

        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm flex items-start">
          <FaExclamationCircle className="mr-2 mt-0.5" />
          <p>{s.alertText}</p>
        </div>
      </motion.div>

      {/* Exit guide */}
      <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 200 }}
        className="max-w-6xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Emergency Exit Guide</h2>
        <p className="text-sm text-gray-600">Your location: <span className="font-medium">{s.exitGuide.locationText}</span></p>
        <p className="text-sm text-gray-600">Nearest exit: <span className="font-medium">{s.exitGuide.nearestExitText}</span></p>
        <Link href={s.exitGuide.linkHref} className="inline-block mt-3 text-[#EF4444] text-sm font-semibold hover:underline">
          {s.exitGuide.linkText}
        </Link>
      </motion.div>

      {/* Contacts */}
      <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 200 }}
        className="max-w-6xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
          <MdEmergency className="text-[#EF4444] w-5 h-5 mr-2" /> Emergency Contacts
        </h2>
        <p className="text-sm text-gray-600 mb-4">Available 24/7 on campus.</p>

        {s.contacts.map((c, i) => (
          <div key={i}
            className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-3 border border-gray-100 hover:border-[#EF4444] transition">
            <div>
              <h3 className="font-medium text-gray-800">{c.name}</h3>
              <p className="text-gray-500 text-sm">{c.phone}</p>
            </div>
            <a href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`} className="text-[#EF4444] hover:text-red-600 text-lg" aria-label={`Call ${c.name}`}>📞</a>
          </div>
        ))}
      </motion.div>

      {/* Bottom cards */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 gap-5 mb-20">
        {s.bottomCards.map((b, idx) => (
          <QuickActionCard
            key={idx}
            href={b.href}
            icon={idx === 0 ? <FaShieldAlt className="w-5 h-5 text-[#EF4444]" /> : <FaMapMarkedAlt className="w-5 h-5 text-[#EF4444]" />}
            title={b.title}
            desc={b.description}
          />
        ))}
      </div>
    </div>
  );
}

function QuickActionCard({ href, icon, title, desc }:{ href: string; icon: React.ReactNode; title: string; desc: string; }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
      <Link href={href}
        className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 hover:border-[#EF4444] hover:shadow-md transition">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg border border-gray-200">{icon}</div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        </div>
        <FaArrowRight className="text-gray-400 w-4 h-4" />
      </Link>
    </motion.div>
  );
}

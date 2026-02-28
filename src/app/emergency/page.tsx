"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { FaDoorOpen, FaShieldAlt, FaPhoneAlt, FaExclamationTriangle } from "react-icons/fa";

type SecuritySettings = { emergencyLabel: string; emergencyTel: string; exitNavLabel: string; exitNavUrl: string; };
const API = "/api/admin/security-settings"; // ← match route

const FALLBACK: SecuritySettings = {
  emergencyLabel: "Emergency 999",
  emergencyTel: "999",
  exitNavLabel: "Exit Navigation",
  exitNavUrl: "/exit-navigation",
};

export default function EmergencyPage() {
  const [cfg, setCfg] = useState<SecuritySettings>(FALLBACK);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const load = async () => {
    try {
      const res = await fetch(API, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const s = (json.settings ?? json) as Partial<SecuritySettings>;
      setCfg({ ...FALLBACK, ...s });
    } catch {
      setCfg(FALLBACK);
    }
  };

  useEffect(() => {
    load();

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("security-settings");
      bcRef.current.onmessage = (m) => { if (m?.data?.type === "updated") load(); };
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === "security-settings:updated") load();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      try { bcRef.current?.close(); } catch {}
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-28">
      {/* Sticky top bar */}
      <div className="sticky top-[56px] md:top-[68px] z-20 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex gap-3">
          <a
            href={`tel:${cfg.emergencyTel}`}
            className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-3 bg-[#EF4444] text-white font-semibold shadow-sm hover:bg-red-600"
          >
            <FaPhoneAlt className="mr-2" /> {cfg.emergencyLabel}
          </a>
          <Link
            href={cfg.exitNavUrl}
            className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-3 bg-gray-900 text-white font-semibold shadow-sm hover:bg-black"
          >
            <FaDoorOpen className="mr-2" /> {cfg.exitNavLabel}
          </Link>
        </div>
      </div>

      <div className="min-h-screen bg-[#fafafa] pb-16">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-900">Emergency Services</h1>
          <p className="text-gray-500 text-sm max-w-2xl">
            Learn what to do during emergencies, how to stay safe on campus, and where to go when immediate help is needed.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6 mb-10">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaExclamationTriangle className="text-red-600 mr-2" />
              What Emergency Services Do
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              The campus emergency services provide rapid response and guidance during accidents, fires, medical incidents, and security threats.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-5 pb-[env(safe-area-inset-bottom)]">
          <NavCard
            icon={<FaDoorOpen className="text-red-600 w-6 h-6" />}
            title="Exit Navigation"
            description="Find the nearest safe exit and follow directions to evacuate quickly."
            href="/exit-navigation"
          />
          <NavCard
            icon={<FaShieldAlt className="text-red-600 w-6 h-6" />}
            title="Staying Safe"
            description="Learn safety tips, emergency procedures, and how to stay prepared."
            href="/safety"
          />
          <NavCard
            icon={<FaPhoneAlt className="text-red-600 w-6 h-6" />}
            title="Emergency Contacts"
            description="Get quick access to campus and public emergency hotlines."
            href="/security-contact"
          />
        </div>
      </div>
    </div>
  );
}

type NavCardProps = { icon: ReactNode; title: string; description: string; href: string };

function NavCard({ icon, title, description, href }: NavCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col justify-between bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#EF4444] transition p-6"
    >
      <div>
        <div className="flex items-center mb-3 space-x-2">
          {icon}
          <h2 className="font-semibold text-gray-900 text-lg">{title}</h2>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="mt-4 text-[#EF4444] text-sm font-medium hover:underline">Learn more →</div>
    </Link>
  );
}

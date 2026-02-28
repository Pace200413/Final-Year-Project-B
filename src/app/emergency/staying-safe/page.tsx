"use client";

import { motion } from "framer-motion";
import {
  FaDoorOpen, FaFireExtinguisher, FaUserShield, FaFirstAid, FaFlask, FaCloudSunRain,
  FaInfoCircle, FaHandsHelping, FaClinicMedical, FaLaptop, FaEnvelope, FaBoxOpen,
  FaBusAlt, FaMapMarkerAlt, FaMoon, FaPhoneAlt, FaComments,
} from "react-icons/fa";
import Link from "next/link";

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Top bar (not sticky) */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex gap-3">
          <a href="tel:999" className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-3 bg-[#EF4444] text-white font-semibold shadow-sm hover:bg-red-600">
            <FaPhoneAlt className="mr-2" /> Emergency 999
          </a>
          <Link href="/exit-navigation" className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-3 bg-gray-900 text-white font-semibold shadow-sm hover:bg-black">
            Go to Exit Navigation
          </Link>
        </div>
      </div>

      {/* Title */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold text-gray-900">
          Staying Safe on Campus
        </motion.h1>
        <p className="text-gray-600 text-sm">Practical guidance for students, staff, and visitors.</p>
      </div>

      {/* Quick Links */}
      <div className="max-w-6xl mx-auto px-6 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <QuickLink icon={<FaPhoneAlt />} label="Security" href="tel:082260607" />
        <QuickLink icon={<FaLaptop />} label="IT Help" href="mailto:helpdesk@swin.edu.my" />
        <QuickLink icon={<FaEnvelope />} label="Report" href="/support" />
      </div>

      {/* Sections */}
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <SafetyCard icon={<FaFireExtinguisher className="text-gray-500" />} title="Fire Safety" text="Remain calm and evacuate. Use stairs, not lifts. Follow exit signs and assist others if safe." link="/exit-navigation" linkLabel="Open Exit Navigation" />
        <SafetyCard icon={<FaUserShield className="text-gray-500" />} title="Personal Safety" text="Stay alert; avoid isolated areas late at night. If you feel unsafe, call Campus Security immediately." link="tel:082260607" linkLabel="Call Security" />
        <SafetyCard icon={<FaFirstAid className="text-gray-500" />} title="Medical Emergencies" text="For urgent help call 999 or Campus Security (082-260-607). Provide your location and stay on the line." link="tel:999" linkLabel="Call 999" />

        <SectionTitle title="Labs & Environment" />
        <SafetyCard icon={<FaFlask className="text-gray-500" />} title="Laboratory Safety" text="Wear PPE and follow instructions. Report spills or incidents at once. Do not work alone." />
        <SafetyCard icon={<FaCloudSunRain className="text-gray-500" />} title="Weather & Environmental Hazards" text="During severe weather, stay indoors and follow campus alerts. Avoid flooded areas." />

        <SectionTitle title="Visitor & Student Help" />
        <SafetyCard icon={<FaInfoCircle className="text-gray-500" />} title="Information Counter" text="ADM Building lobby, weekdays 8:30–17:00. Get directions, passes, and assistance." />
        <SafetyCard icon={<FaHandsHelping className="text-gray-500" />} title="Student Support Centre" text="Need help with housing or wellbeing? Call 082-260-610." />

        <SectionTitle title="Lost & Found" />
        <SafetyCard icon={<FaBoxOpen className="text-gray-500" />} title="Report Lost Items" text="Visit Campus Security Office or call 082-260-607. Items are held up to 30 days." link="tel:082260607" linkLabel="Call Security" />

        <SectionTitle title="Health & Wellness" />
        <SafetyCard icon={<FaClinicMedical className="text-gray-500" />} title="On-Campus Clinic" text="Open Mon–Fri, 9:00–16:00. Next to the Student Centre." />
        <SafetyCard icon={<FaHandsHelping className="text-gray-500" />} title="Counselling" text="Confidential support via counselling@swin.edu.my or 082-260-620." link="mailto:counselling@swin.edu.my" linkLabel="Email Counselling" />

        <SectionTitle title="Transport & Night Escort" />
        <SafetyCard icon={<FaBusAlt className="text-gray-500" />} title="Campus Shuttle" text="Free shuttle runs 8:00–18:00 between main buildings." />
        <SafetyCard icon={<FaMapMarkerAlt className="text-gray-500" />} title="Visitor Parking" text="Parking near ADM Building; permits at the Information Counter." />
        <SafetyCard icon={<FaMoon className="text-gray-500" />} title="Security Escort (Night)" text="Security escorts are available after dark between buildings." link="tel:082260607" linkLabel="Request Escort" />

        <SectionTitle title="Feedback" />
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
          <FaComments className="text-gray-500 w-6 h-6 mx-auto mb-3" />
          <h2 className="font-semibold text-gray-800 mb-2">We value your feedback</h2>
          <p className="text-sm text-gray-600 mb-4">Have a concern, suggestion, or safety issue? Let us know.</p>
          <Link href="/support" className="inline-block bg-[#EF4444] text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-red-600">
            Go to Support / Report
          </Link>
        </div>
      </div>
    </div>
  );
}

function SafetyCard({ icon, title, text, link, linkLabel }: { icon: React.ReactNode; title: string; text: string; link?: string; linkLabel?: string; }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-lg">{icon}</div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <p className="text-sm text-gray-700 mb-3">{text}</p>
      {link && <Link href={link} className="text-[#EF4444] text-sm font-medium hover:underline">{linkLabel ?? "Learn more"}</Link>}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-lg font-semibold text-gray-800 pt-6 pb-1 border-b border-gray-100">{title}</h3>;
}

function QuickLink({ icon, label, href }: { icon: React.ReactNode; label: string; href: string; }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-4 text-gray-700">
      <div className="text-gray-500 text-lg mb-1">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

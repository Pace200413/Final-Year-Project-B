import type { Service } from "@/components/appTypes";

/**
 * Directory cards content (Swinburne Sarawak)
 * Keep card UI identical to Events/Safety cards.
 */
export const SERVICES: Service[] = [
  {
    slug: "it", // -> /support/it
    name: "IT Service Desk",
    category: "IT Support",
    desc: "Accounts, Wi-Fi, Canvas, Student Portal.",
    hours: "Mon–Fri 09:00–17:00",
    // email intentionally omitted so the card links to the page, not mailto
  },
  {
    slug: "facilities", // -> /support/facilities
    name: "Facilities Helpdesk",
    category: "Facilities",
    desc: "Air-con, lighting, classroom equipment, maintenance.",
    hours: "Mon–Fri 09:00–17:00",
  },
  {
    slug: "campus-security", // link overridden to tel via phone below
    name: "Campus Security",
    category: "Safety",
    desc: "Emergencies & safety on campus.",
    hours: "24/7",
    phone: "082-260991", // will render tel:082260607
  },
  {
    slug: "wellbeing", // if you don’t have a page, mailto will be used
    name: "Student Wellbeing & Counselling",
    category: "Wellbeing",
    desc: "Counselling, wellbeing support, referrals.",
    hours: "Mon–Fri 09:00–17:00",
    email: "counselling@swin.edu.my",
  },
  {
    slug: "library", // -> /support/library
    name: "Library Help",
    category: "Academic",
    desc: "Library services, research help, referencing.",
    hours: "Mon–Fri 09:00–17:00",
  },
];

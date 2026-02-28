"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { copyToClipboard, showToast } from "@/lib/client";
import { formatTimeForDisplay } from "@/lib/utils";
import {
  CalendarIcon,
  CompassIcon,
  HealthIcon,
  InfoIcon,
  MoneyIcon,
  ShieldIcon,
  SupportIcon,
  WellbeingIcon,
  WifiIcon,
} from "@/components/MobileShell";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  context?: string; // Context for state machine
  buttons?: string[]; // Buttons for this message
  meta?: MessageMeta;
}

interface MessageMeta {
  template?: string;
  email?: string;
}

interface BotResponse {
  text: string;
  context: string;
  buttons: string[];
  meta?: MessageMeta;
}

// Department data with emails and working hours (phones only used for Security)
const DEPARTMENTS = {
  it_helpdesk: {
    name: "IT Service Desk",
    email: "itservicedesk@swinburne.edu.my",
    phone: "+60 82 123 400",
    hours: "Mon–Fri, 8:30 AM – 5:00 PM",
  },
  student_services: {
    name: "Student Services",
    email: "studentservices@swinburne.edu.my",
    phone: "+60 82 123 410",
    hours: "Mon–Fri, 8:30 AM – 5:00 PM",
  },
  student_finance: {
    name: "Student Finance",
    email: "studentfinance@swinburne.edu.my",
    phone: "+60 82 123 420",
    hours: "Mon–Fri, 8:30 AM – 4:30 PM",
  },
  library: {
    name: "Library & Learning Commons",
    email: "library@swinburne.edu.my",
    phone: "+60 82 123 430",
    hours: "Mon–Fri, 8:30 AM – 9:00 PM; Sat, 10:00 AM – 4:00 PM",
  },
  counselling: {
    name: "Counselling & Wellbeing",
    email: "counselling@swinburne.edu.my",
    phone: "+60 82 123 440",
    hours: "Mon–Fri, 9:00 AM – 4:30 PM",
  },
  health_centre: {
    name: "Campus Health Centre",
    email: "healthcentre@swinburne.edu.my",
    phone: "+60 82 123 450",
    hours: "Mon–Fri, 8:30 AM – 4:30 PM",
  },
  security: {
    name: "Campus Security",
    email: "security@swinburne.edu.my",
    phone: "+60 82 123 460",
    hours: "24 hours (phone); Office counter 8:30 AM – 5:00 PM",
  },
  international_support: {
    name: "International Student Support",
    email: "international@swinburne.edu.my",
    phone: "+60 82 123 470",
    hours: "Mon–Fri, 8:30 AM – 5:00 PM",
  },
  accommodation: {
    name: "Accommodation Office",
    email: "accommodation@swinburne.edu.my",
    phone: "+60 82 123 480",
    hours: "Mon–Fri, 8:30 AM – 5:00 PM",
  },
  careers: {
    name: "Careers & Employability",
    email: "careers@swinburne.edu.my",
    phone: "+60 82 123 490",
    hours: "Mon–Fri, 9:00 AM – 4:30 PM",
  },
};

// Email templates for copy actions
const EMAIL_TEMPLATES = {
  lecturer:
    "Hi, I am unwell and may miss class. I will visit the Campus Health Centre and update you if I receive any medical note. Thank you.",
  counselling:
    "Hi, I am a student at Swinburne Sarawak and I would like to request a counselling appointment. Please let me know the available times. Thank you.",
  clinic:
    "Hi, I am a student at Swinburne Sarawak and I would like to ask about an appointment at the Campus Health Centre. Please let me know the available times. Thank you.",
  finance:
    "Hi, I am a student at Swinburne Sarawak and I have a question about my fees and payment options. Please let me know what information you need from me. Thank you.",
  services:
    "Hi, I am a student at Swinburne Sarawak and I need help with my enrolment or course support. Please advise on the next steps. Thank you.",
  report:
    "Hi, I would like to report an incident and ask about the next steps. Please let me know how I should proceed. Thank you.",
  it:
    "Hi, I am a student at Swinburne Sarawak and I am having a problem with my WiFi, login, or app access. Please help check my account or connection. Thank you.",
};

type CategoryCard = {
  id: string;
  label: string;
  description: string;
  query: string;
  icon: ReactNode;
  iconBg: string;
  iconText: string;
};

// Category definitions for main menu grid
const CATEGORIES: CategoryCard[] = [
  {
    id: "navigation",
    label: "Navigation",
    description: "Find buildings & toilets",
    icon: <CompassIcon />,
    query: "navigation",
    iconBg: "bg-rose-50",
    iconText: "text-rose-600",
  },
  {
    id: "health",
    label: "Health",
    description: "Clinic & physical support",
    icon: <HealthIcon />,
    query: "health",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
  {
    id: "bullying",
    label: "Safety & Respect",
    description: "Speak up & report issues",
    icon: <SupportIcon />,
    query: "bullying & harassment",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
  {
    id: "safety",
    label: "Security",
    description: "Contact campus security",
    icon: <ShieldIcon />,
    query: "safety & security",
    iconBg: "bg-red-50",
    iconText: "text-red-600",
  },
  {
    id: "fees",
    label: "Fees & Enrolment",
    description: "Payments, enrolment, aid",
    icon: <MoneyIcon />,
    query: "fees & enrolment",
    iconBg: "bg-orange-50",
    iconText: "text-orange-600",
  },
  {
    id: "tech",
    label: "Tech & WiFi",
    description: "WiFi, Canvas or app help",
    icon: <WifiIcon />,
    query: "tech & wifi",
    iconBg: "bg-sky-50",
    iconText: "text-sky-600",
  },
  {
    id: "events",
    label: "Events & Clubs",
    description: "See what's happening",
    icon: <CalendarIcon />,
    query: "events & clubs",
    iconBg: "bg-violet-50",
    iconText: "text-violet-600",
  },
  {
    id: "wellbeing",
    label: "Wellbeing",
    description: "Counselling & support",
    icon: <WellbeingIcon />,
    query: "wellbeing & counselling",
    iconBg: "bg-pink-50",
    iconText: "text-pink-600",
  },
  {
    id: "app",
    label: "App Help / FAQ",
    description: "Learn what the app can do",
    icon: <InfoIcon />,
    query: "app help / faq",
    iconBg: "bg-slate-100",
    iconText: "text-slate-500",
  },
];

const QUICK_REPLY_ONLY_CONTEXTS = new Set<string>([
  "EVENTS_TODAY",
  "NAVIGATION_MENU",
]);

interface AssistantChatProps {
  onClose: () => void;
}

function createEmailTemplateResponse({
  title,
  template,
  email,
  context,
}: {
  title: string;
  template: string;
  email?: string;
  context: string;
}): BotResponse {
  const bodySegments = [
    "Here’s a message you can send:",
    email ? `Email: ${email}` : "Send this from your student email.",
  ];

  return {
    text: `${title}\n\n${bodySegments.join("\n\n")}`,
    context,
    buttons: email
      ? ["Copy message", "Copy email address", "🏠 main menu"]
      : ["Copy message", "🏠 main menu"],
    meta: {
      template,
      email,
    },
  };
}

// Main router for top-level categories
function getBotResponse(userMessage: string, currentContext?: string): BotResponse {
  const q = userMessage.toLowerCase().trim();

  // Navigation
  if (q === "navigation" || q === "navigate") {
    return {
      text:
        "Navigation\n\nWhat do you want to find?\n1. A block or classroom\n2. Nearest facility (toilet, clinic, etc.)\n3. Campus map\n\nTap a quick option or reply in your own words.",
      context: "NAVIGATION_MENU",
      buttons: ["block / room", "nearest facility", "campus map", "🏠 main menu"],
    };
  }

  // Health – main reply
  if (q === "health") {
    return {
      text: `Health support

I can help you find the campus clinic or connect you with counselling support.

Is this about your body or your mind?`,
      context: "HEALTH_MENU",
      buttons: ["physical", "mental", "🏠 main menu"],
    };
  }

  // Bullying & harassment
  if (q === "bullying & harassment" || q === "bullying") {
    return {
      text: `Bullying & harassment

I'm sorry if something is happening.

What do you want to do?
1) Talk to someone about bullying
2) See reporting options
3) Get campus security help`,
      context: "BULLYING_MENU",
      buttons: [
        "talk to counsellor",
        "report incident",
        "security help",
        "🏠 main menu",
        "close chat",
      ],
    };
  }

  // Safety & security – main reply
  if (q === "safety & security" || q === "safety") {
    return {
      text: `Safety & security

If you feel in danger, move to a bright, busy place and contact Campus Security.

Campus Security

Hours:
${DEPARTMENTS.security.hours}

Email:
${DEPARTMENTS.security.email}

What do you need now?`,
      context: "SAFETY_MENU",
      buttons: ["security number", "security office route", "🏠 main menu"],
    };
  }

  // Fees & enrolment – main reply
  if (
    q === "fees & enrolment" ||
    q === "fees" ||
    q === "enrolment" ||
    q === "services"
  ) {
    return {
      text: `Fees & enrolment

Student Finance and Student Services can help with fees, payment plans, enrolment changes, and general course support.

Student Finance
Hours: ${DEPARTMENTS.student_finance.hours}
Email: ${DEPARTMENTS.student_finance.email}

Student Services
Hours: ${DEPARTMENTS.student_services.hours}
Email: ${DEPARTMENTS.student_services.email}

What do you need help with?`,
      context: "SERVICES_MENU",
      buttons: ["fees / payment", "enrolment", "scholarship", "🏠 main menu"],
    };
  }

  // Tech & WiFi – main reply
  if (q === "tech & wifi" || q === "tech" || q === "wifi") {
    return {
      text: `Tech & WiFi

IT Service Desk can help with WiFi, login issues, and problems with university apps or systems.

IT Service Desk

Hours:
${DEPARTMENTS.it_helpdesk.hours}

Email:
${DEPARTMENTS.it_helpdesk.email}

What seems to be the problem?`,
      context: "TECH_MENU",
      buttons: ["wifi", "canvas", "app issue", "🏠 main menu"],
    };
  }

  // Events & clubs
  if (q === "events & clubs" || q === "events") {
    return {
      text:
        "Events & clubs\n\nWhat are you looking for?\n1) Events today\n2) Club fair / societies\n3) Regular weekly events",
      context: "EVENTS_MENU",
      buttons: ["events today", "club fair", "weekly events", "🏠 main menu"],
    };
  }

  // Wellbeing & counselling – main reply
  if (q === "wellbeing & counselling" || q === "wellbeing") {
    return {
      text: `Wellbeing & counselling

University life can be stressful, and it’s completely okay to ask for support. Counselling & Wellbeing offers free and confidential support for students.

Counselling & Wellbeing
Hours: ${DEPARTMENTS.counselling.hours}
Email: ${DEPARTMENTS.counselling.email}

What would you like help with?`,
      context: "WELLBEING_MENU",
      buttons: ["talk to counsellor", "stress help", "balance tips", "🏠 main menu"],
    };
  }

  // App help
  if (q === "app help / faq" || q === "app help" || q === "app") {
    return {
      text:
        "App help\n\nWhat do you want to know?\n1) What this app can do\n2) How to use AR\n3) How favourites work",
      context: "APP_HELP_MENU",
      buttons: ["app features", "ar mode", "favourites", "🏠 main menu"],
    };
  }

  // Delegate to context handler
  return handleContextFlow(q, currentContext);
}

// Context-based chatbot response logic
function handleContextFlow(q: string, context?: string): BotResponse {
  // ---------------- NAVIGATION ----------------
  if (context === "NAVIGATION_MENU") {
    if (q === "block / room" || q === "block" || q === "room") {
      return {
        text:
          "Blocks & rooms\n\nWhat do you want to do?\n1) Go to a block (G, F, C)\n2) Learn how to find a specific room",
        context: "NAV_BLOCK_MENU",
        buttons: ["go to block", "find room", "🏠 main menu", "close chat"],
      };
    }
    if (q === "nearest facility" || q === "facility") {
      return {
        text:
          "Which facility do you need right now?\n1) Toilet\n2) Clinic\n3) Library\n4) Prayer room\n5) Cafeteria",
        context: "NAV_FACILITY_MENU",
        buttons: [
          "toilet",
          "clinic",
          "library",
          "prayer room",
          "cafeteria",
          "🏠 main menu",
          "close chat",
        ],
      };
    }
    if (q === "campus map" || q === "map") {
      return {
        text:
          "Campus map\n\nI can open the campus map so you can zoom and tap buildings.",
        context: "NAV_MAP",
        buttons: ["centre on my location", "show full campus", "🏠 main menu", "close chat"],
      };
    }
  }

  if (context === "NAV_BLOCK_MENU") {
    if (q === "go to block") {
      return {
        text: "Pick a block to start a route.",
        context: "NAV_BLOCK_PICK",
        buttons: ["block g", "block f", "block c", "use campus map", "🏠 main menu", "close chat"],
      };
    }
    if (q === "find room") {
      return {
        text:
          "To find a specific room, it's best to use the campus map or QR codes in corridors. I can guide you to the right block first.",
        context: "NAV_ROOM_INFO",
        buttons: ["go to block", "campus map", "🏠 main menu", "close chat"],
      };
    }
  }

  if (context === "NAV_BLOCK_PICK") {
    if (q === "block g" || q === "block f" || q === "block c") {
      const blockLabel = q.toUpperCase();
      const contextId = `NAV_BLOCK_ROUTE_${blockLabel.replace(" ", "_")}`;
      return {
        text: `${blockLabel}\n\nI’ll start a walking route to ${blockLabel}.`,
        context: contextId,
        buttons: ["start route", "see on map", "🏠 main menu", "close chat"],
      };
    }
    if (q === "use campus map") {
      return {
        text:
          "I’ll open the campus map. Tap your block and start a route from there.",
        context: "NAV_BLOCK_USE_MAP",
        buttons: ["campus map", "🏠 main menu", "close chat"],
      };
    }
  }

  if (context && context.startsWith("NAV_BLOCK_ROUTE_")) {
    const blockLabel = context
      .replace("NAV_BLOCK_ROUTE_", "")
      .replace("_", " ");
    if (q === "start route") {
      return {
        text: `Navigation to ${blockLabel} started.\n\nAnything else?`,
        context: "NAV_BLOCK_STARTED",
        buttons: ["nearest facility", "🏠 main menu", "close chat"],
      };
    }
    if (q === "see on map") {
      return {
        text: `Campus map opened at ${blockLabel}. You can start a route from there.\n\nAnything else?`,
        context: "NAV_BLOCK_MAP",
        buttons: ["nearest facility", "🏠 main menu", "close chat"],
      };
    }
  }

  if (context === "NAV_MAP") {
    if (q === "centre on my location" || q === "my location") {
      return {
        text:
          "Campus map centred on your location. You can tap buildings to start a route.\n\nAnything else?",
        context: "NAV_MAP_OPENED",
        buttons: ["navigation", "🏠 main menu", "close chat"],
      };
    }
    if (q === "show full campus" || q === "full campus") {
      return {
        text:
          "Campus map showing the full campus. Zoom and tap to explore.\n\nAnything else?",
        context: "NAV_MAP_OPENED",
        buttons: ["navigation", "🏠 main menu", "close chat"],
      };
    }
  }

  if (context === "NAV_FACILITY_MENU") {
    if (q === "toilet") {
      return {
        text: "I’ll find the nearest toilet and guide you there. Start route?",
        context: "NAV_TOILET_CONFIRM",
        buttons: ["start route", "see on map", "🏠 main menu", "close chat"],
      };
    }
    if (q === "clinic") {
      return {
        text: `Campus clinic

I’ll guide you to the Campus Health Centre. Start route?

Campus Health Centre

Hours:
${DEPARTMENTS.health_centre.hours}

Email:
${DEPARTMENTS.health_centre.email}`,
        context: "NAV_CLINIC_CONFIRM",
        buttons: ["start route", "see on map", "🏠 main menu", "close chat"],
      };
    }
    if (q === "library") {
      return {
        text: `Library

I’ll guide you to the Library & Learning Commons. Start route?

Library & Learning Commons

Hours:
${DEPARTMENTS.library.hours}

Email:
${DEPARTMENTS.library.email}`,
        context: "NAV_LIBRARY_CONFIRM",
        buttons: ["start route", "see on map", "🏠 main menu", "close chat"],
      };
    }
    if (q === "prayer room") {
      return {
        text: "I’ll guide you to the nearest prayer room. Start route?",
        context: "NAV_PRAYER_CONFIRM",
        buttons: ["start route", "see on map", "🏠 main menu", "close chat"],
      };
    }
    if (q === "cafeteria") {
      return {
        text: "I’ll guide you to the nearest cafeteria. Start route?",
        context: "NAV_CAFE_CONFIRM",
        buttons: ["start route", "see on map", "🏠 main menu", "close chat"],
      };
    }
  }

  if (context && context.startsWith("NAV_") && context.endsWith("_CONFIRM")) {
    const key = context.replace("NAV_", "").replace("_CONFIRM", "").toLowerCase();
    const facilityNameMap: Record<string, string> = {
      toilet: "the nearest toilet",
      clinic: "the Campus Health Centre",
      library: "the Library & Learning Commons",
      prayer: "the nearest prayer room",
      cafe: "the nearest cafeteria",
    };
    const facilityName = facilityNameMap[key] || "your destination";

    if (q === "start route") {
      return {
        text: `Navigation to ${facilityName} started.\n\nAnything else?`,
        context: "NAV_FACILITY_STARTED",
        buttons: ["🏠 main menu", "close chat"],
      };
    }
    if (q === "see on map") {
      return {
        text: `Campus map opened near ${facilityName}. You can start a route from there.\n\nAnything else?`,
        context: "NAV_FACILITY_MAP",
        buttons: ["🏠 main menu", "close chat"],
      };
    }
  }

  // ---------------- HEALTH ----------------
  if (context === "HEALTH_MENU") {
    if (q === "physical") {
      return {
        text: `Physical health

What are you feeling right now?`,
        context: "HEALTH_PHYSICAL_MENU",
        buttons: ["headache", "fever", "stomach pain", "clinic info", "🏠 main menu"],
      };
    }
    if (q === "mental") {
      return {
        text: `Mental health

Feeling stressed or low can happen to anyone, and you don’t have to handle it alone.

What describes how you feel right now?`,
        context: "HEALTH_MENTAL_MENU",
        buttons: ["stress / anxiety", "feeling low", "panic", "🏠 main menu"],
      };
    }
  }

  if (context === "HEALTH_PHYSICAL_MENU") {
    if (q === "headache") {
      return {
        text: `Headache

Try to rest in a quiet place and drink some water. If the headache is strong or does not go away, it is safer to see the campus clinic.

Campus Health Centre

Hours:
${DEPARTMENTS.health_centre.hours}

Email:
${DEPARTMENTS.health_centre.email}

Do you want the route to the clinic now?`,
        context: "HEALTH_HEADACHE",
        buttons: ["yes", "no"],
      };
    }
    if (q === "fever") {
      return {
        text: `Fever

Fever can sometimes be serious. If your temperature is high or you feel very unwell, you should visit the campus clinic as soon as possible.

Campus Health Centre

Hours:
${DEPARTMENTS.health_centre.hours}

Email:
${DEPARTMENTS.health_centre.email}

Do you want the route to the clinic now?`,
        context: "HEALTH_FEVER",
        buttons: ["yes", "no"],
      };
    }
    if (q === "stomach pain" || q === "stomach") {
      return {
        text: `Stomach pain

Strong or ongoing stomach pain should be checked by a medical professional, especially if it has lasted for a while. The campus clinic can assess your symptoms.

Campus Health Centre

Hours:
${DEPARTMENTS.health_centre.hours}

Email:
${DEPARTMENTS.health_centre.email}

Do you want the route to the clinic now?`,
        context: "HEALTH_STOMACH",
        buttons: ["yes", "no"],
      };
    }
    if (q === "clinic info") {
      return {
        text: `Campus Health Centre

The campus clinic can help with common illnesses, minor injuries, and basic check-ups.

Hours:
${DEPARTMENTS.health_centre.hours}

Email:
${DEPARTMENTS.health_centre.email}

What do you want to do?`,
        context: "HEALTH_CLINIC_INFO",
        buttons: ["start clinic route", "email clinic", "🏠 main menu"],
      };
    }
  }

  if (context === "HEALTH_MENTAL_MENU") {
    if (q === "stress / anxiety" || q === "stress" || q === "anxiety") {
      return {
        text: `Stress and anxiety

Heavy stress and constant worry can make it hard to focus on study and daily life. Counselling & Wellbeing can support you in a private and safe space.

Counselling & Wellbeing

Hours:
${DEPARTMENTS.counselling.hours}

Email:
${DEPARTMENTS.counselling.email}

What would help you most right now?`,
        context: "HEALTH_STRESS",
        buttons: [
          "route to counselling",
          "email counselling",
          "self-help tips",
          "🏠 main menu",
        ],
      };
    }
    if (q === "feeling low" || q === "depressed") {
      return {
        text: `Feeling low

I’m sorry you’re feeling this way. Talking to someone trained to listen can make things feel a bit lighter, even if the situation doesn’t change immediately.

Counselling & Wellbeing

Hours:
${DEPARTMENTS.counselling.hours}

Email:
${DEPARTMENTS.counselling.email}

What would you like to do now?`,
        context: "HEALTH_DEPRESSED",
        buttons: [
          "route to counselling",
          "email counselling",
          "self-help tips",
          "🏠 main menu",
        ],
      };
    }
    if (q === "panic") {
      return {
        text: `Panic and feeling overwhelmed

Try to slow your breathing: breathe in gently through your nose, hold for a few seconds, then breathe out slowly through your mouth. Repeat this a few times.

If you still feel unsafe or unwell, please go to Counselling & Wellbeing or the Campus Health Centre as soon as you can.

Counselling & Wellbeing
Email: ${DEPARTMENTS.counselling.email}

Campus Health Centre
Email: ${DEPARTMENTS.health_centre.email}

If there is an immediate risk to your safety, contact Campus Security.`,
        context: "HEALTH_PANIC",
        buttons: ["route to counselling", "clinic route", "security number", "🏠 main menu"],
      };
    }
  }

  if (context === "HEALTH_CLINIC_INFO") {
    if (q === "start clinic route") {
      return {
        text: `Clinic route

I’ll start a walking route to the Campus Health Centre from your current location.

Navigation to the clinic has started.

Anything else you need with health?`,
        context: "HEALTH_CLINIC_ROUTE",
        buttons: ["🏠 main menu", "close chat"],
      };
    }
    if (q === "email clinic") {
      return createEmailTemplateResponse({
        title: "Emailing Campus Health Centre",
        template: EMAIL_TEMPLATES.clinic,
        email: DEPARTMENTS.health_centre.email,
        context: "EMAIL_CLINIC",
      });
    }
  }

  // ---------------- BULLYING ----------------
  if (context === "BULLYING_MENU") {
    if (q === "talk to counsellor") {
      return {
        text: `Talk to a counsellor

You can speak to a counsellor in person on campus or request an appointment by email. Sessions are confidential and focused on supporting you.

How would you like to contact them?`,
        context: "BULLYING_COUNSELLOR",
        buttons: ["route to counselling", "email counselling", "🏠 main menu", "close chat"],
      };
    }
    if (q === "report incident") {
      return {
        text: `Report incident

Student Services can help with formal reports about bullying or harassment.

Student Services

Hours:
${DEPARTMENTS.student_services.hours}

Email:
${DEPARTMENTS.student_services.email}

What do you want to do?`,
        context: "BULLYING_REPORT",
        buttons: ["email report", "student services route", "🏠 main menu", "close chat"],
      };
    }
    if (q === "security help") {
      return {
        text: `Safety & security

Campus Security helps with on-campus safety and emergencies.

Campus Security

Hours:
${DEPARTMENTS.security.hours}

Email:
${DEPARTMENTS.security.email}

What do you need?
1) Security phone number
2) Route to security office`,
        context: "SAFETY_MENU",
        buttons: ["security number", "security office route", "🏠 main menu"],
      };
    }
  }

  if (context === "BULLYING_REPORT") {
    if (q === "student services route") {
      return {
        text: "Navigation to Student Services started.\n\nAnything else?",
        context: "BULLYING_SERVICES_ROUTE",
        buttons: ["🏠 main menu", "close chat"],
      };
    }
  }

  // ---------------- SAFETY & SECURITY ----------------
  if (context === "SAFETY_MENU") {
    if (q === "security number") {
      return {
        text: `Campus Security – phone

Phone:
${DEPARTMENTS.security.phone}

Email:
${DEPARTMENTS.security.email}

Hours:
${DEPARTMENTS.security.hours}

Do you want to copy the number or get the route to the security office?`,
        context: "SAFETY_NUMBER",
        buttons: ["copy number", "security office route", "🏠 main menu", "close chat"],
      };
    }
    if (q === "security office route") {
      return {
        text: `Route to security office

I’ll start a walking route to the security office from your current location.

Navigation started.

Anything else you need with safety or security?`,
        context: "SAFETY_ROUTE_STARTED",
        buttons: ["🏠 main menu", "close chat"],
      };
    }
  }

  // ---------------- SERVICES (FEES & ENROLMENT) ----------------
  if (context === "SERVICES_MENU") {
    if (q === "fees / payment" || q === "fees" || q === "payment") {
      return {
        text: `Fees and payment

Student Finance can help with outstanding fees, payment plans, and questions about invoices.

Student Finance

Hours:
${DEPARTMENTS.student_finance.hours}

Email:
${DEPARTMENTS.student_finance.email}

What do you want to do?`,
        context: "SERVICES_FEES",
        buttons: ["route to finance", "email finance", "🏠 main menu", "close chat"],
      };
    }
    if (q === "enrolment") {
      return {
        text: `Enrolment and subjects

Student Services can help you add or drop units, check prerequisites, and understand enrolment rules.

Student Services

Hours:
${DEPARTMENTS.student_services.hours}

Email:
${DEPARTMENTS.student_services.email}

What do you want to do?`,
        context: "SERVICES_ENROLMENT",
        buttons: ["route to services", "email services", "🏠 main menu", "close chat"],
      };
    }
    if (q === "scholarship") {
      return {
        text: `Scholarships and support

Student Services can explain scholarship options, financial assistance, and any supporting documents you might need.

Student Services

Hours:
${DEPARTMENTS.student_services.hours}

Email:
${DEPARTMENTS.student_services.email}

What do you want to do?`,
        context: "SERVICES_SCHOLARSHIP",
        buttons: ["route to services", "email services", "🏠 main menu", "close chat"],
      };
    }
  }

  if (context === "SERVICES_FEES") {
    if (q === "route to finance") {
      return {
        text: "Navigation to Student Finance started.\n\nAnything else?",
        context: "SERVICES_FEES_ROUTE",
        buttons: ["🏠 main menu", "close chat"],
      };
    }
    if (q === "email finance") {
      return createEmailTemplateResponse({
        title: "Emailing Student Finance",
        template: EMAIL_TEMPLATES.finance,
        email: DEPARTMENTS.student_finance.email,
        context: "EMAIL_FINANCE",
      });
    }
  }

  if (context === "SERVICES_ENROLMENT" || context === "SERVICES_SCHOLARSHIP") {
    if (q === "route to services") {
      return {
        text: "Navigation to Student Services started.\n\nAnything else?",
        context: "SERVICES_SERVICES_ROUTE",
        buttons: ["🏠 main menu", "close chat"],
      };
    }
    if (q === "email services") {
      return createEmailTemplateResponse({
        title: "Emailing Student Services",
        template: EMAIL_TEMPLATES.services,
        email: DEPARTMENTS.student_services.email,
        context: "EMAIL_SERVICES",
      });
    }
  }

  // ---------------- TECH & WIFI ----------------
  if (context === "TECH_MENU") {
    if (q === "wifi" || q === "wifi / internet" || q === "wifi problem") {
      return {
        text: `WiFi or internet

Try these quick checks first:
– Make sure WiFi is turned on.
– Forget the campus network and reconnect.
– Check that you are using your correct username and password.

Have you already tried these steps?`,
        context: "TECH_WIFI",
        buttons: ["yes", "no"],
      };
    }
    if (q === "canvas" || q === "canvas / login" || q === "canvas login") {
      return {
        text: `Canvas or login

Make sure you are using your correct student ID and password. If you have changed your password recently, try logging out everywhere and logging in again.

If Canvas or your account is still not working, the IT Service Desk can reset or check your access.`,
        context: "TECH_CANVAS",
        buttons: ["email it", "🏠 main menu", "close chat"],
      };
    }
    if (q === "app issue" || q === "app problem" || q === "app / system issue") {
      return {
        text: `App or system issue

Try closing the app completely and reopening it. If possible, check that you have an internet connection and the latest version of the app.

If the problem continues, send a short description and screenshot to the IT Service Desk.`,
        context: "TECH_APP",
        buttons: ["email it", "🏠 main menu", "close chat"],
      };
    }
  }

  if (context === "TECH_WIFI") {
    if (q === "yes") {
      return {
        text: `Next step: IT Service Desk

Since the quick checks didn’t solve it, the IT Service Desk can investigate your connection in more detail.

IT Service Desk

Hours:
${DEPARTMENTS.it_helpdesk.hours}

Email:
${DEPARTMENTS.it_helpdesk.email}

What do you want to do now?`,
        context: "TECH_WIFI_IT",
        buttons: ["email it", "🏠 main menu", "close chat"],
      };
    }
    if (q === "no") {
      return {
        text: `Try the quick steps

Please try those checks first. They fix most WiFi issues on campus.

If it still doesn’t work after that, you can contact the IT Service Desk using your student email.`,
        context: "TECH_WIFI_TRY",
        buttons: ["email it", "🏠 main menu", "close chat"],
      };
    }
  }

  // Email IT from any relevant tech context
  if (q === "email it") {
    return createEmailTemplateResponse({
      title: "Emailing IT Service Desk",
      template: EMAIL_TEMPLATES.it,
      email: DEPARTMENTS.it_helpdesk.email,
      context: "EMAIL_IT",
    });
  }

  // ---------------- EVENTS & CLUBS ----------------
  if (context === "EVENTS_MENU") {
    if (q === "events today") {
      return {
        text:
          "Events today\n\n1. Film night\n2. Coding lab\n3. Sports meetup\n\nTap one to see details.",
        context: "EVENTS_TODAY",
        buttons: [
          "film night",
          "coding lab",
          "sports meetup",
          "🏠 main menu",
        ],
      };
    }
    if (q === "club fair") {
      return {
        text:
          "Club fair is happening this week. Do you want navigation to the fair location?",
        context: "EVENTS_CLUB_FAIR",
        buttons: ["start route", "save favourite", "🏠 main menu", "close chat"],
      };
    }
    if (q === "weekly events") {
      return {
        text:
          "Regular weekly events include study groups, sports sessions, and social meetups. Do you want to see the full schedule?",
        context: "EVENTS_WEEKLY",
        buttons: ["view schedule", "🏠 main menu", "close chat"],
      };
    }
  }

  if (context === "EVENTS_TODAY") {
    if (q === "film night" || q === "coding lab" || q === "sports meetup") {
      const label = q.charAt(0).toUpperCase() + q.slice(1);
      return {
        text: `${label}\n\nAt [location] today. What would you like to do?`,
        context: "EVENTS_EVENT_SELECTED",
        buttons: ["start route", "save favourite", "🏠 main menu"],
      };
    }
  }

  if (context === "EVENTS_EVENT_SELECTED" || context === "EVENTS_CLUB_FAIR") {
    if (q === "start route") {
      return {
        text: "Navigation to the event started.\n\nAnything else?",
        context: "EVENTS_ROUTE_STARTED",
        buttons: ["🏠 main menu", "close chat"],
      };
    }
    if (q === "save favourite") {
      return {
        text: "Event saved to favourites.\n\nAnything else?",
        context: "EVENTS_FAV_SAVED",
        buttons: ["🏠 main menu", "close chat"],
      };
    }
  }

  if (context === "EVENTS_WEEKLY" && q === "view schedule") {
    return {
      text:
        "Opening the weekly events schedule in the events page.\n\nAnything else?",
      context: "EVENTS_SCHEDULE",
      buttons: ["🏠 main menu", "close chat"],
    };
  }

  // ---------------- WELLBEING & COUNSELLING ----------------
  if (context === "WELLBEING_MENU") {
    if (q === "talk to counsellor") {
      return {
        text: `Talk to a counsellor

You can speak to a counsellor in person on campus or request an appointment by email. Sessions are confidential and focused on supporting you.

How would you like to contact them?`,
        context: "WELLBEING_TALK",
        buttons: ["route to counselling", "email counselling", "🏠 main menu", "close chat"],
      };
    }
    if (q === "stress help") {
      return {
        text: `Help with stress

When stress builds up, it becomes harder to focus and enjoy daily life. Small changes and support can make it more manageable.

Would you like some quick self-help tips, or would you prefer to speak to a counsellor?`,
        context: "WELLBEING_STRESS",
        buttons: [
          "self-help tips",
          "route to counselling",
          "email counselling",
          "🏠 main menu",
        ],
      };
    }
    if (q === "balance tips") {
      return {
        text: `Study–life balance

Keeping a healthy balance between study, rest, and social life can protect your wellbeing and your grades.

I can share a few simple habits that help many students, or you can book time with Counselling & Wellbeing to talk through your routine in more detail.`,
        context: "WELLBEING_BALANCE",
        buttons: [
          "self-help tips",
          "route to counselling",
          "email counselling",
          "🏠 main menu",
        ],
      };
    }
  }

  if (q === "self-help tips") {
    return {
      text: `Self-help tips

A few small steps that often help:
– Break large tasks into very small pieces.
– Take short breaks away from your screen.
– Move your body a little each day, even a short walk.
– Stay connected with at least one friend or family member.

If things still feel heavy, it’s a good idea to talk to Counselling & Wellbeing.`,
      context: "SELF_HELP_TIPS",
      buttons: ["route to counselling", "email counselling", "🏠 main menu", "close chat"],
    };
  }

  // Shared: route to counselling
  if (q === "route to counselling") {
    return {
      text: `Counselling route

I’ll start a walking route to Counselling & Wellbeing from your current location.

Navigation to counselling has started.

Anything else you need?`,
      context: "COUNSELLING_ROUTE",
      buttons: ["🏠 main menu", "close chat"],
    };
  }

  // Shared: clinic route (from panic, etc.)
  if (q === "clinic route" || q === "start clinic route") {
    return {
      text: `Clinic route

I’ll start a walking route to the Campus Health Centre from your current location.

Navigation to the clinic has started.

Anything else you need with health?`,
      context: "HEALTH_CLINIC_ROUTE",
      buttons: ["🏠 main menu", "close chat"],
    };
  }

  // ---------------- APP HELP ----------------
  if (context === "APP_HELP_MENU") {
    if (q === "app features") {
      return {
        text:
          "This app can:\n\n1) Show walking routes and AR arrows\n2) Find nearest toilets, clinic, library, prayer room, cafeteria\n3) Show events and guide you there\n4) Save favourites\n5) Give simple health and services guidance\n\nDo you want to try quick navigation now?",
        context: "APP_FEATURES",
        buttons: ["navigation", "events & clubs", "🏠 main menu", "close chat"],
      };
    }
    if (q === "ar mode") {
      return {
        text:
          "AR mode shows arrows over your camera view to guide you in real space.\n\nDo you want to use AR for your next route?",
        context: "APP_AR",
        buttons: ["yes", "no"],
      };
    }
    if (q === "favourites") {
      return {
        text:
          "Favourites let you save places or events to open quickly later.\n\nDo you want to save your current destination as a favourite?",
        context: "APP_FAVOURITES",
        buttons: ["yes", "no"],
      };
    }
  }

  // ---------------- EMAIL TEMPLATES ----------------
  if (q === "email counselling") {
    return createEmailTemplateResponse({
      title: "Emailing Counselling & Wellbeing",
      template: EMAIL_TEMPLATES.counselling,
      email: DEPARTMENTS.counselling.email,
      context: "EMAIL_COUNSELLING",
    });
  }

  if (q === "email lecturer") {
    return createEmailTemplateResponse({
      title: "Emailing your lecturer",
      template: EMAIL_TEMPLATES.lecturer,
      context: "EMAIL_LECTURER",
    });
  }

  if (q === "email report") {
    return createEmailTemplateResponse({
      title: "Emailing Student Services (report)",
      template: EMAIL_TEMPLATES.report,
      email: DEPARTMENTS.student_services.email,
      context: "EMAIL_REPORT",
    });
  }

  // ---------------- YES / NO HANDLER ----------------
  if (q === "yes" || q === "no") {
    const isYes = q === "yes";

    // Physical health yes/no
    if (
      context === "HEALTH_HEADACHE" ||
      context === "HEALTH_FEVER" ||
      context === "HEALTH_STOMACH"
    ) {
      if (isYes) {
        return {
          text: `Clinic route

I’ll start a walking route to the Campus Health Centre from your current location.

Navigation to the clinic has started.

Anything else you need with health?`,
          context: "HEALTH_CLINIC_ROUTE",
          buttons: ["🏠 main menu", "close chat"],
        };
      }
      return {
        text: `Okay

You can visit the Campus Health Centre during their opening hours if you feel worse or if the symptoms don’t improve.

If you need to let your lecturer know you might miss class, I can help you draft a simple email.`,
        context: "HEALTH_CLINIC_LATER",
        buttons: ["email lecturer", "🏠 main menu", "close chat"],
      };
    }

    // Tech WiFi yes/no handled earlier in TECH_WIFI block, but keep here as safety
    if (context === "TECH_WIFI") {
      if (isYes) {
        return {
          text: `Next step: IT Service Desk

Since the quick checks didn’t solve it, the IT Service Desk can investigate your connection in more detail.

IT Service Desk

Hours:
${DEPARTMENTS.it_helpdesk.hours}

Email:
${DEPARTMENTS.it_helpdesk.email}

What do you want to do now?`,
          context: "TECH_WIFI_IT",
          buttons: ["email it", "🏠 main menu", "close chat"],
        };
      }
      return {
        text: `Try the quick steps

Please try those checks first. They fix most WiFi issues on campus.

If it still doesn’t work after that, you can contact the IT Service Desk using your student email.`,
        context: "TECH_WIFI_TRY",
        buttons: ["email it", "🏠 main menu", "close chat"],
      };
    }

    // App AR preference
    if (context === "APP_AR") {
      if (isYes) {
        return {
          text:
            "AR mode enabled. Start navigation now to see AR arrows?",
          context: "APP_AR_ENABLED",
          buttons: ["navigation", "🏠 main menu", "close chat"],
        };
      }
      return {
        text: "Map mode selected. Start navigation?",
        context: "APP_MAP_MODE",
        buttons: ["navigation", "🏠 main menu", "close chat"],
      };
    }

    // App favourites
    if (context === "APP_FAVOURITES") {
      if (isYes) {
        return {
          text: "Favourite saved.\n\nAnything else?",
          context: "APP_FAVOURITE_SAVED",
          buttons: ["🏠 main menu", "close chat"],
        };
      }
      return {
        text: "Okay, not saved.\n\nAnything else?",
        context: "APP_FAVOURITE_SKIP",
        buttons: ["🏠 main menu", "close chat"],
      };
    }

    // Nav block started yes/no (from earlier design – if you still use it)
    if (context === "NAV_BLOCK_STARTED") {
      if (isYes) {
        return {
          text:
            "Okay, later you can ask for room help once you reach the block. Anything else now?",
          context: "NAV_BLOCK_ROOM_HELP",
          buttons: ["🏠 main menu", "close chat"],
        };
      }
      return {
        text:
          "Okay, route is running. You can close this chat anytime. Anything else?",
        context: "NAV_COMPLETE",
        buttons: ["🏠 main menu", "close chat"],
      };
    }
  }

  // ---------------- DEFAULT FALLBACK ----------------
  return {
    text:
      "I can help with navigation, health, safety, fees, tech, events, and app help.\n\nUse the main menu to pick a topic.",
    context: "MAIN_MENU",
    buttons: [],
  };
}

// Helper to create the welcome message
function createWelcomeMessage(): Message {
  return {
    id: `welcome-${Date.now()}`,
    text:
      "Hi, I'm Swinburne campus assistant.\n\nI can help you find places on campus, get support, or fix common issues.\n\nWhat do you need now?",
    isUser: false,
    timestamp: new Date(),
    context: "MAIN_MENU",
    buttons: [],
  };
}

export default function AssistantChat({ onClose }: AssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([createWelcomeMessage()]);
  const [isTyping, setIsTyping] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef(0);
  const currentDragOffsetRef = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const getLatestActionableBotMessage = (list: Message[] = messages) => {
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const candidate = list[i];
      if (!candidate.isUser && candidate.context !== "COPIED") {
        return candidate;
      }
    }
    return undefined;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Drag to close functionality
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    dragStartYRef.current = clientY;
    currentDragOffsetRef.current = 0;
    setDragOffset(0);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: TouchEvent | MouseEvent) => {
      e.preventDefault();
      const clientY =
        "touches" in e
          ? (e as TouchEvent).touches[0].clientY
          : (e as MouseEvent).clientY;
      const delta = clientY - dragStartYRef.current;
      if (delta > 0) {
        currentDragOffsetRef.current = delta;
        setDragOffset(delta);
      }
    };

    const handleEnd = () => {
      if (currentDragOffsetRef.current > 100) {
        onClose();
      } else {
        setDragOffset(0);
        currentDragOffsetRef.current = 0;
      }
      setIsDragging(false);
    };

    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);

    return () => {
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
    };
  }, [isDragging, onClose]);

  // Get buttons for last bot message
  const actionableBotMessage = getLatestActionableBotMessage();
  const lastBotButtons = actionableBotMessage?.buttons || [];
  const actionableButtons = lastBotButtons.filter((button) => {
    const normalized = button.toLowerCase().trim();
    return normalized !== "🏠 main menu" && normalized !== "main menu" && normalized !== "close chat";
  });
  const isQuickReplyOnly =
    !!actionableBotMessage?.context &&
    QUICK_REPLY_ONLY_CONTEXTS.has(actionableBotMessage.context);

  let primaryAction: string | undefined;
  let secondaryAction: string | undefined;
  let tertiaryAction: string | undefined;
  let quickReplyActions: string[] = [];

  if (isQuickReplyOnly) {
    quickReplyActions = actionableButtons;
  } else {
    [
      primaryAction,
      secondaryAction,
      tertiaryAction,
      ...quickReplyActions
    ] = actionableButtons;
  }

  const hasPrimaryActions =
    !isQuickReplyOnly &&
    (!!primaryAction || !!secondaryAction || !!tertiaryAction);

  const resetToMainMenu = () => {
    setIsTyping(false);
    setMessages([createWelcomeMessage()]);
  };

  const pushCopiedConfirmation = () => {
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Copied to clipboard. Anything else?",
      isUser: false,
      timestamp: new Date(),
      context: "COPIED",
      buttons: [],
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  const sendMessage = async (text: string) => {
    const cleaned = text.trim();
    if (!cleaned) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: cleaned,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 400 + Math.random() * 400)
    );

    setMessages((prev) => {
      const lastBot = getLatestActionableBotMessage(prev);
      const currentContext = lastBot?.context;

      const response = getBotResponse(cleaned, currentContext);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        context: response.context,
        buttons: response.buttons,
        meta: response.meta,
      };

      setIsTyping(false);
      return [...prev, botMessage];
    });
  };

  const handleActionButton = (action: string) => {
    const actionLower = action.toLowerCase().trim();

    // Close chat button
    if (actionLower === "close chat") {
      onClose();
      return;
    }

    // Main menu reset
    if (actionLower === "🏠 main menu" || actionLower === "main menu") {
      resetToMainMenu();
      return;
    }

    // Copy phone number (only security)
    if (actionLower === "copy number") {
      const lastBot = getLatestActionableBotMessage();
      const ctx = lastBot?.context;
      if (ctx === "SAFETY_NUMBER") {
        const valueToCopy = DEPARTMENTS.security.phone;
        copyToClipboard(valueToCopy);
        showToast("Copied to clipboard");
        pushCopiedConfirmation();
        return;
      }
    }

    // Copy template content
    if (actionLower === "copy email text" || actionLower === "copy message") {
      const lastBot = getLatestActionableBotMessage();
      const ctx = lastBot?.context;
      let valueToCopy = lastBot?.meta?.template || "";

      if (!valueToCopy && ctx) {
        if (ctx === "EMAIL_COUNSELLING") valueToCopy = EMAIL_TEMPLATES.counselling;
        else if (ctx === "EMAIL_LECTURER") valueToCopy = EMAIL_TEMPLATES.lecturer;
        else if (ctx === "EMAIL_CLINIC") valueToCopy = EMAIL_TEMPLATES.clinic;
        else if (ctx === "EMAIL_FINANCE") valueToCopy = EMAIL_TEMPLATES.finance;
        else if (ctx === "EMAIL_SERVICES") valueToCopy = EMAIL_TEMPLATES.services;
        else if (ctx === "EMAIL_REPORT") valueToCopy = EMAIL_TEMPLATES.report;
        else if (ctx === "EMAIL_IT") valueToCopy = EMAIL_TEMPLATES.it;
      }

      if (valueToCopy) {
        copyToClipboard(valueToCopy);
        showToast("Copied to clipboard");
        pushCopiedConfirmation();
        return;
      }
    }

    if (actionLower === "copy email address") {
      const lastBot = getLatestActionableBotMessage();
      const emailAddress = lastBot?.meta?.email;

      if (emailAddress) {
        copyToClipboard(emailAddress);
        showToast("Email copied");
        pushCopiedConfirmation();
        return;
      }

      showToast("Email unavailable");
      return;
    }

    // Default: treat button label as user message
    sendMessage(action);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-stretch justify-center"
        style={{ overscrollBehavior: "contain" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(199, 0, 57, 0.08) 0%, rgba(255, 255, 255, 0.95) 30%, rgba(248, 250, 252, 1) 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(199, 0, 57, 0.08) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div
          ref={sheetRef}
          className="relative z-10 w-full max-w-2xl px-4 sm:px-6 transition-transform duration-300"
          style={{
            paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)",
            transform:
              dragOffset > 0 ? `translateY(${dragOffset}px)` : "translateY(0)",
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
          role="dialog"
          aria-labelledby="chat-title"
        >
          <div
            className="flex h-full flex-col rounded-[32px] border border-white/80 bg-white/90 shadow-[0_25px_60px_rgba(15,23,42,0.12)] backdrop-blur"
            style={{
              minHeight:
                "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
              maxHeight:
                "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
            }}
          >
            <div
              ref={handleRef}
              className="flex justify-center pt-2 pb-1 text-slate-400"
              onTouchStart={handleDragStart}
              onMouseDown={handleDragStart}
            >
              <div className="h-px w-9 rounded-full bg-slate-300" />
            </div>

            <header className="border-b border-slate-100 px-6 pt-3 pb-2 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d4002a] to-[#f25a38] text-sm font-semibold text-white shadow-sm">
                    CA
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span
                      id="chat-title"
                      className="text-[15px] font-semibold text-slate-900"
                    >
                      Campus Assistant
                    </span>
                    <span className="text-[12px] text-slate-500">
                      Always here to help
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#fee2e2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b00020]">
                  1 ISSUE
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={resetToMainMenu}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[13px] font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                >
                  Main menu
                </button>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    <span aria-hidden="true">⚡</span>
                    Powered by Campus Assistant
                  </span>
                  <button
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
                    aria-label="Close chat"
                  >
                    ×
                  </button>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-hidden">
              <div
                className="chat-scroll flex h-full flex-col overflow-y-auto px-4 py-4 sm:px-6"
                role="log"
                aria-live="polite"
              >
                {messages.map((message, index) => {
                  const previousMessage =
                    index > 0 ? messages[index - 1] : undefined;
                  const nextMessage =
                    index < messages.length - 1
                      ? messages[index + 1]
                      : undefined;
                  const startsNewExchange =
                    previousMessage && !previousMessage.isUser && message.isUser;
                  const isImmediateBotReply =
                    previousMessage && previousMessage.isUser && !message.isUser;
                  const spacingClass =
                    index === 0
                      ? ""
                      : isImmediateBotReply
                      ? "mt-2"
                      : startsNewExchange
                      ? "mt-5"
                      : "mt-3";
                  const isClusterEnd =
                    !nextMessage || nextMessage.isUser !== message.isUser;
                  const timestampLabel = formatTimeForDisplay(message.timestamp);
                  const isActionableMessage =
                    !message.isUser &&
                    actionableBotMessage?.id === message.id;
                  let heading: string | undefined;
                  let bodySections: string[] = [];

                  if (!message.isUser) {
                    const sections = message.text
                      .split("\n\n")
                      .map((section) => section.trim())
                      .filter(Boolean);
                    if (sections.length > 1) {
                      heading = sections.shift();
                    }
                    bodySections = sections.length
                      ? sections
                      : heading
                      ? []
                      : [message.text];
                  }

                  const isSystemNotice =
                    !message.isUser && message.context === "COPIED";

                  return (
                    <div
                      key={message.id}
                      className={`${spacingClass} message-enter flex ${
                        message.isUser ? "justify-end" : "justify-start"
                      }`}
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      {message.isUser ? (
                        <div className="flex max-w-[86%] flex-col items-end gap-1">
                          <div className="w-full rounded-3xl rounded-br-md bg-[#d4002a] px-4 py-3 text-[13px] leading-[1.35] text-white shadow-[0_10px_30px_rgba(212,0,42,0.25)]">
                            <p className="whitespace-pre-line">{message.text}</p>
                          </div>
                          {isClusterEnd && timestampLabel && (
                            <p className="text-[11px] text-white/70">
                              {timestampLabel}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex max-w-[92%] flex-col gap-1.5">
                          <div className="flex items-center gap-2 pl-1">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6243] to-[#ff2b4a] text-[11px] font-semibold uppercase text-white shadow-sm">
                              AI
                            </div>
                            <span className="text-[11px] uppercase tracking-wide text-slate-500">
                              Campus Assistant
                            </span>
                          </div>
                          <div
                            className={`w-full rounded-3xl px-4 py-3 text-[13px] leading-[1.4] ${
                              isSystemNotice
                                ? "rounded-2xl border border-slate-100 bg-slate-50 text-slate-500"
                                : "rounded-bl-md border border-slate-100 bg-white text-slate-700 shadow-sm"
                            }`}
                          >
                            {heading && (
                              <p className="text-[14px] font-semibold text-slate-900">
                                {heading}
                              </p>
                            )}
                            {bodySections.map((section, sectionIndex) => {
                              const paragraphMargin =
                                (sectionIndex === 0 && heading) || sectionIndex > 0
                                  ? "mt-1.5"
                                  : "";
                              return (
                                <div
                                  key={`${message.id}-section-${sectionIndex}`}
                                  className="w-full"
                                >
                                  <p
                                    className={`${paragraphMargin} whitespace-pre-line text-[13px] leading-[1.4] text-slate-700`}
                                  >
                                    {section}
                                  </p>
                                  {message.meta?.template &&
                                    sectionIndex === 0 && (
                                      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[12.5px] leading-[1.4] text-slate-700">
                                        {message.meta.template}
                                      </div>
                                    )}
                                </div>
                              );
                            })}
                            {!bodySections.length && message.meta?.template && (
                              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[12.5px] leading-[1.4] text-slate-700">
                                {message.meta.template}
                              </div>
                            )}

                            {isActionableMessage &&
                              message.context === "MAIN_MENU" && (
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                  {CATEGORIES.map((category) => (
                                    <button
                                      key={category.id}
                                      onClick={() =>
                                        handleActionButton(category.query)
                                      }
                                      className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-slate-100 bg-white/90 px-3 py-2 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md active:scale-[0.99]"
                                    >
                                      <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${category.iconBg} ${category.iconText}`}
                                      >
                                        {category.icon}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-[13px] font-semibold text-slate-900">
                                          {category.label}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                          {category.description}
                                        </p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>

                          {isClusterEnd && timestampLabel && (
                            <p className="self-end text-[11px] text-slate-400">
                              {timestampLabel}
                            </p>
                          )}

                          {isActionableMessage &&
                            message.context !== "MAIN_MENU" &&
                            hasPrimaryActions && (
                              <div className="flex w-full flex-col gap-2">
                                {primaryAction && (
                                  <button
                                    onClick={() =>
                                      handleActionButton(primaryAction)
                                    }
                                    className="h-10 w-full rounded-full bg-[#d4002a] text-[13px] font-semibold text-white shadow-[0_10px_25px_rgba(212,0,42,0.2)] transition-all duration-200 hover:bg-[#b90024] active:scale-[0.99]"
                                  >
                                    {primaryAction}
                                  </button>
                                )}
                                {secondaryAction && (
                                  <button
                                    onClick={() =>
                                      handleActionButton(secondaryAction)
                                    }
                                    className="h-10 w-full rounded-full border border-[#ffd2d7] bg-gradient-to-b from-white to-[#fff8f8] text-[13px] font-semibold text-[#d4002a] transition-all duration-200 hover:border-[#ffb7c1] active:scale-[0.99]"
                                  >
                                    {secondaryAction}
                                  </button>
                                )}
                                {tertiaryAction && (
                                  <button
                                    onClick={() =>
                                      handleActionButton(tertiaryAction)
                                    }
                                    className="text-left text-[12.5px] font-semibold text-[#c00028] underline decoration-transparent transition-all duration-200 hover:decoration-[#c00028]"
                                  >
                                    {tertiaryAction}
                                  </button>
                                )}
                              </div>
                            )}

                          {isActionableMessage &&
                            quickReplyActions.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {quickReplyActions.map((chip, chipIndex) => (
                                  <button
                                    key={`${chip}-${chipIndex}`}
                                    onClick={() => handleActionButton(chip)}
                                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white active:scale-95"
                                  >
                                    {chip.charAt(0).toUpperCase() + chip.slice(1)}
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="message-enter flex justify-start" style={{ animationDelay: "0ms" }}>
                    <div className="mr-3 mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-semibold text-slate-500 shadow-sm">
                      AI
                    </div>
                    <div className="rounded-3xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="typing-dot h-2 w-2 rounded-full bg-slate-300" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-slate-300" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-slate-300" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .chat-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.4);
          border-radius: 999px;
        }
        .message-enter {
          animation: chatMessageIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes chatMessageIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .typing-dot {
          animation: typing 1.2s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.15s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.3s;
        }
        @keyframes typing {
          0%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .message-enter {
            animation: none;
          }
          .typing-dot {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}


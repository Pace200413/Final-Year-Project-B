import supportSettings from "@/data/support-settings.json";

export type CmsPageSlug =
  | "student-essentials"
  | "new-to-swinburne"
  | "scholarships"
  | "book-a-room"
  | "security-contact"
  | "support"
  | "safety"
  | "emergency";

export type StudentEssentialsContent = {
  items: Array<{
    title: string;
    href: string;
    image: string;
    alt: string;
  }>;
};

export type NewToSwinburneContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
  topCards: Array<{
    title: string;
    href: string;
    image: string;
    alt: string;
    description: string;
    tag: string;
    icon: string;
  }>;
  bottomCards: Array<{
    title: string;
    href: string;
    image: string;
    alt: string;
    description: string;
    tag: string;
    icon: string;
  }>;
  recommendedSteps: Array<{
    title: string;
    subtitle: string;
    icon: string;
  }>;
};

export type ScholarshipsContent = {
  hero: {
    title: string;
    subtitle: string;
  };
  items: Array<{
    title: string;
    href: string;
    image: string;
    alt: string;
    tag: string;
    description: string;
  }>;
};

export type BookARoomContent = {
  hero: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
  };
  quickInfo: Array<{
    label: string;
    icon: string;
    wide?: boolean;
  }>;
  steps: Array<{
    title: string;
    desc: string;
    icon: string;
  }>;
  rules: string[];
};

export type SecurityContactStep = {
  number: string;
  title: string;
  text: string;
};

export type SecurityContactItem = {
  name: string;
  phone: string;
  isPrimary?: boolean;
};

export type SecurityContactBottomCard = {
  title: string;
  description: string;
  href: string;
};

export type SecurityContactContent = {
  eyebrow: string;
  title: string;
  subtitle: string;

  stripCallSecurityLabel: string;
  stripCall999Label: string;
  stripFindExitLabel: string;

  backToHubLabel: string;
  backToHubHref: string;

  alertText: string;

  stepsTitle: string;
  stepsSubtitle: string;
  steps: SecurityContactStep[];

  exitTitle: string;
  exitSubtitle: string;
  exitLocationText: string;
  exitNearestText: string;
  exitLinkText: string;
  exitLinkHref: string;
  exitNavUrl: string;

  contactsTitle: string;
  contactsSubtitle: string;
  contacts: SecurityContactItem[];

  bottomCards: SecurityContactBottomCard[];
};

export type SupportStatusItem = {
  name: string;
  ok: boolean;
  href?: string;
};

export type SupportPageContent = {
  eyebrow: string;
  title: string;
  description: string;

  alertCta: string;
  shortcuts: unknown[];
  faqs: unknown[];
  routing: Record<string, string>;

  backToHubLabel: string;
  backToHubHref: string;

  stripCallSecurityLabel: string;
  stripCall999Label: string;
  stripFindExitLabel: string;
  exitNavUrl: string;

  alertPhone: string;
  inlineAlertText: string;

  drawerButtonLabel: string;
  browseButtonLabel: string;

  browseTitle: string;
  browseDescription: string;

  drawerTitle: string;
  drawerDescription: string;

  status: SupportStatusItem[];
  services: unknown[];
};

export type SafetyContentSection = {
  id: string;
  group: string;
  title: string;
  text: string;
  link?: string;
  linkLabel?: string;
};

export type SafetyContent = {
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;

  stripEmergencyLabel: string;
  stripSecurityLabel: string;
  stripReportLabel: string;

  emergencyNumber: string;
  securityNumber: string;
  reportUrl: string;
  reportLabel: string;

  itHelpEmail: string;
  itHelpLabel: string;

  quickNote: string;

  sectionsTitle: string;
  sectionsSubtitle: string;
  sections: SafetyContentSection[];

  feedbackHeading: string;
  feedbackDescription: string;
  feedbackButtonText: string;
  feedbackButtonHref: string;
};

export type EmergencyQuickTile = {
  icon: "userShield" | "firstAid" | "fireExtinguisher" | "comments";
  title: string;
  subtitle: string;
  href: string;
};

export type EmergencyMoreHelpCard = {
  icon: "shield" | "fireExtinguisher" | "comments" | "door";
  title: string;
  description: string;
  href: string;
};

export type EmergencyHowToStep = {
  title: string;
  text: string;
};

export type EmergencyContent = {
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;

  stripCallSecurityLabel: string;
  stripCall999Label: string;
  stripFindExitLabel: string;

  emergencyLabel: string;
  emergencyTel: string;
  emergencySubtitle: string;

  exitNavLabel: string;
  exitNavUrl: string;
  exitNavSubtitle: string;

  secondaryLinkLabel: string;
  secondaryLinkHref: string;

  alertText: string;

  quickSectionTitle: string;
  quickSectionSubtitle: string;
  quickTiles: EmergencyQuickTile[];

  moreHelpTitle: string;
  moreHelpSubtitle: string;
  moreHelpCards: EmergencyMoreHelpCard[];

  howToTitle: string;
  howToSubtitle: string;
  howToSteps: EmergencyHowToStep[];
};

const DEFAULT_SUPPORT_SERVICES = Array.isArray(supportSettings.services)
  ? supportSettings.services
  : [];

const DEFAULT_SUPPORT_STATUS = Array.isArray(supportSettings.status)
  ? supportSettings.status
  : [];

const DEFAULT_SUPPORT_SHORTCUTS = Array.isArray(supportSettings.shortcuts)
  ? supportSettings.shortcuts
  : [];

const DEFAULT_SUPPORT_FAQS = Array.isArray(supportSettings.faqs)
  ? supportSettings.faqs
  : [];

const DEFAULT_SUPPORT_ROUTING =
  supportSettings.routing && typeof supportSettings.routing === "object"
    ? (supportSettings.routing as Record<string, string>)
    : {};

const DEFAULT_SUPPORT_ALERT_PHONE =
  typeof supportSettings.alert?.phone === "string"
    ? supportSettings.alert.phone
    : "082260991";

const DEFAULT_SUPPORT_ALERT_TEXT =
  typeof supportSettings.alert?.text === "string"
    ? supportSettings.alert.text
    : "Need urgent help? Call Campus Security";

const DEFAULT_SUPPORT_ALERT_CTA =
  typeof supportSettings.alert?.cta === "string"
    ? supportSettings.alert.cta
    : "Call now";

export const CMS_PAGE_CONFIG = {
  "student-essentials": {
    title: "Student Essentials",
    contentTable: "student_essentials_content",
    auditTable: "student_essentials_audit",
    defaultContent: {
      items: [
        {
          title: "Student Information",
          href: "https://www.swinburne.edu.my/student-information-centre/",
          image: "/images/student_essentials/student-information.jpg",
          alt: "Student information",
        },
        {
          title: "International Student Services",
          href: "https://www.swinburne.edu.my/international-student-centre/",
          image: "/images/student_essentials/international-student-services.jpg",
          alt: "International student services",
        },
        {
          title: "Managing Your Enrolment",
          href: "https://www.swinburne.edu.my/enrolment/",
          image: "/images/student_essentials/managing-your-enrolment.jpg",
          alt: "Managing your enrolment",
        },
        {
          title: "Safer Community",
          href: "https://www.swinburne.edu.my/safer-community-swinburne/",
          image: "/images/student_essentials/safer-community.jpg",
          alt: "Safer community",
        },
        {
          title: "Paying Your Fees",
          href: "https://www.swinburne.edu.my/paying-fees/",
          image: "/images/student_essentials/paying-your-fees.jpg",
          alt: "Paying your fees",
        },
        {
          title: "Exams, Results and Student Progression",
          href: "https://www.swinburne.edu.my/exams-results-assessment/",
          image: "/images/student_essentials/exams-results-student-progression.jpg",
          alt: "Exams, results and student progression",
        },
        {
          title: "Graduation and Course Completion",
          href: "https://www.swinburne.edu.my/graduation/",
          image: "/images/student_essentials/graduation-course-completion.jpg",
          alt: "Graduation and course completion",
        },
      ],
    } satisfies StudentEssentialsContent,
  },

  "new-to-swinburne": {
    title: "New to Swinburne",
    contentTable: "new_to_swinburne_content",
    auditTable: "new_to_swinburne_audit",
    defaultContent: {
      hero: {
        eyebrow: "Start here",
        title: "New to Swinburne",
        subtitle: "Main official links new students usually need first.",
        primaryCtaLabel: "Checklist",
        primaryCtaHref:
          "https://www.swinburne.edu.my/current-students/get-started/enrolment-for-new-students/",
        secondaryCtaLabel: "O-Week",
        secondaryCtaHref:
          "https://www.swinburne.edu.my/current-students/get-started/o-week/",
      },
      topCards: [
        {
          title: "O-Week",
          href: "https://www.swinburne.edu.my/current-students/get-started/o-week/",
          image: "/images/new-to-swinburne/o-week.jpg",
          alt: "O-Week",
          description:
            "Orientation activities, first-week information, and campus life.",
          tag: "Get started",
          icon: "Sparkles",
        },
        {
          title: "Checklist",
          href: "https://www.swinburne.edu.my/current-students/get-started/enrolment-for-new-students/",
          image: "/images/new-to-swinburne/checklist.jpg",
          alt: "Checklist for new students",
          description: "Important enrolment and onboarding steps for new students.",
          tag: "Important",
          icon: "CheckCircle2",
        },
        {
          title: "Program Study Planner",
          href: "https://www.swinburne.edu.my/current-students/get-started/program-study-planner/",
          image: "/images/new-to-swinburne/program-study-planner.jpg",
          alt: "Program study planner",
          description:
            "Plan your subjects and understand your study path better.",
          tag: "Planning",
          icon: "BookOpen",
        },
      ],
      bottomCards: [
        {
          title: "Wifi, Library and Systems",
          href: "https://www.swinburne.edu.my/current-students/get-started/access-wi-fi-library-systems/",
          image: "/images/new-to-swinburne/wifi-library-systems.jpg",
          alt: "Wifi, library and systems",
          description: "Access wifi, library resources, and student systems.",
          tag: "Campus access",
          icon: "Wifi",
        },
        {
          title: "Student Guides",
          href: "https://www.swinburne.edu.my/current-students/get-started/student-guides/",
          image: "/images/new-to-swinburne/student-guides.jpg",
          alt: "Student guides",
          description: "Official guides for student processes and campus support.",
          tag: "Guides",
          icon: "FileText",
        },
      ],
      recommendedSteps: [
        {
          title: "Checklist",
          subtitle: "Complete the main setup steps first.",
          icon: "CheckCircle2",
        },
        {
          title: "O-Week",
          subtitle: "Explore orientation and campus life.",
          icon: "Sparkles",
        },
        {
          title: "Wifi & Library",
          subtitle: "Set up your key student systems.",
          icon: "Wifi",
        },
        {
          title: "Study Planner",
          subtitle: "Understand your subject pathway.",
          icon: "BookOpen",
        },
        {
          title: "Student Guides",
          subtitle: "Use official help and process guides.",
          icon: "FileText",
        },
      ],
    } satisfies NewToSwinburneContent,
  },

  scholarships: {
    title: "Scholarships",
    contentTable: "scholarships_content",
    auditTable: "scholarships_audit",
    defaultContent: {
      hero: {
        title: "Scholarships & Payment Plans",
        subtitle: "Official funding links for every study level.",
      },
      items: [
        {
          title: "Scholarships for Foundation programs",
          href: "https://www.swinburne.edu.my/study/study-with-us/scholarships-foundation/",
          image: "/images/scholarships/foundation-programs.jpg",
          alt: "Foundation scholarship information",
          tag: "Foundation",
          description:
            "Official scholarships for foundation students starting their studies at Swinburne Sarawak.",
        },
        {
          title: "Scholarships for Diploma programs",
          href: "https://www.swinburne.edu.my/study/study-with-us/scholarships-diploma/",
          image: "/images/scholarships/diploma-programs.jpg",
          alt: "Diploma scholarship information",
          tag: "Diploma",
          description:
            "Explore available diploma scholarships and official eligibility details for diploma applicants.",
        },
        {
          title: "Scholarships for Undergraduate programs",
          href: "https://www.swinburne.edu.my/study/study-with-us/scholarships-undergraduate/",
          image: "/images/scholarships/undergraduate-programs.jpg",
          alt: "Undergraduate scholarship information",
          tag: "Undergraduate",
          description:
            "Official scholarship opportunities for undergraduate students, including tuition support pathways.",
        },
        {
          title: "Scholarships for Postgraduate programs",
          href: "https://www.swinburne.edu.my/study/study-with-us/scholarships-postgraduate/",
          image: "/images/scholarships/postgraduate-programs.jpg",
          alt: "Postgraduate scholarship information",
          tag: "Postgraduate",
          description:
            "Postgraduate scholarship options for advanced study, with official application information and guidance.",
        },
        {
          title: "Instalment Payment Plan",
          href: "https://www.swinburne.edu.my/study/study-with-us/easy-payment-plan/",
          image: "/images/scholarships/instalment-payment-plan.jpg",
          alt: "Instalment payment plan information",
          tag: "Payment plan",
          description:
            "Spread tuition payments into manageable instalments through the official Swinburne payment plan page.",
        },
      ],
    } satisfies ScholarshipsContent,
  },

  "book-a-room": {
    title: "Book a Room",
    contentTable: "book_a_room_content",
    auditTable: "book_a_room_audit",
    defaultContent: {
      hero: {
        title: "Discussion Room Booking",
        subtitle: "Book a library discussion room through Skedda.",
        ctaLabel: "Book on Skedda",
        ctaHref: "https://myvenuehub.skedda.com/",
      },
      quickInfo: [
        { label: "2h max", icon: "Clock3" },
        { label: "Min 3 users", icon: "Users" },
        { label: "Check-in required", icon: "Shield", wide: true },
      ],
      steps: [
        {
          title: "Sign in",
          desc: "Log in to Skedda to begin your booking.",
          icon: "LogIn",
        },
        {
          title: "Location",
          desc: "Select Library discussion rooms.",
          icon: "MapPin",
        },
        {
          title: "Pick room",
          desc: "Choose an available room. Green means available.",
          icon: "DoorOpen",
        },
        {
          title: "Set booking",
          desc: "Choose date, time, and duration. Maximum is 2 hours.",
          icon: "CalendarDays",
        },
        {
          title: "Attendees",
          desc: "Enter the total number of users.",
          icon: "Users",
        },
        {
          title: "Unconfirmed",
          desc: "Mark the booking request as unconfirmed.",
          icon: "AlertCircle",
        },
        {
          title: "Confirm",
          desc: "Accept the conditions and confirm your booking.",
          icon: "CheckCircle2",
        },
      ],
      rules: [
        "Minimum 3 users.",
        "Maximum 2 hours per booking.",
        "Check-in is required.",
        "Unattended rooms for 15 minutes may be terminated.",
        "Keep noise at a reasonable level.",
        "Do not move furniture.",
        "Do not leave belongings unattended.",
        "Keep the room neat and orderly.",
      ],
    } satisfies BookARoomContent,
  },

  "security-contact": {
    title: "Security Contact",
    contentTable: "security_contact_content",
    auditTable: "security_contact_audit",
    defaultContent: {
      eyebrow: "Safety Hub",
      title: "Emergency Contacts",
      subtitle:
        "Tap a contact to call. For urgent danger, call Security or 999 first.",

      stripCallSecurityLabel: "Call Security",
      stripCall999Label: "Call 999",
      stripFindExitLabel: "Find Exit",

      backToHubLabel: "Back to hub",
      backToHubHref: "/emergency",

      alertText:
        "If there is immediate danger, injury, smoke, fire, or a serious security concern, call first and move to a safer location.",

      stepsTitle: "In an emergency",
      stepsSubtitle: "Do these 3 steps first.",
      steps: [
        {
          number: "1",
          title: "Call first",
          text: "Call Campus Security or 999 immediately if the situation is urgent.",
        },
        {
          number: "2",
          title: "Move to safety",
          text: "Leave the area if needed and use Find Exit to evacuate quickly.",
        },
        {
          number: "3",
          title: "Follow instructions",
          text: "Follow directions from campus staff, security, or emergency responders.",
        },
      ],

      exitTitle: "Find Exit",
      exitSubtitle: "Use during evacuation if it’s safe to move.",
      exitLocationText: "Your location will appear here.",
      exitNearestText: "Nearest exit will be suggested automatically.",
      exitLinkText: "Find Exit",
      exitLinkHref: "/exit-navigation",
      exitNavUrl: "/exit-navigation",

      contactsTitle: "Contacts",
      contactsSubtitle: "Tap a contact to call directly from mobile.",
      contacts: [
        { name: "Campus Security", phone: "082-260-991", isPrimary: true },
        { name: "Emergency Services", phone: "999", isPrimary: false },
        { name: "Health Clinic", phone: "082-260-620", isPrimary: false },
      ],

      bottomCards: [
        {
          title: "What to do",
          description:
            "Step-by-step guidance for fire, medical, weather, personal safety, and more.",
          href: "/safety",
        },
        {
          title: "Get Help / Report",
          description:
            "Non-urgent support, reporting, service contacts, and FAQs.",
          href: "/support",
        },
      ],
    } satisfies SecurityContactContent,
  },

  support: {
    title: "Support",
    contentTable: "support_page_content",
    auditTable: "support_page_audit",
    defaultContent: {
      eyebrow: "Safety Hub",
      title: "Get Help / Report",
      description:
        "Use this page for non-urgent help and service contacts. If it’s urgent, call Security or 999.",

      alertCta: DEFAULT_SUPPORT_ALERT_CTA,
      shortcuts: DEFAULT_SUPPORT_SHORTCUTS,
      faqs: DEFAULT_SUPPORT_FAQS,
      routing: DEFAULT_SUPPORT_ROUTING,

      backToHubLabel: "Back to hub",
      backToHubHref: "/emergency",

      stripCallSecurityLabel: "Call Security",
      stripCall999Label: "Call 999",
      stripFindExitLabel: "Find Exit",
      exitNavUrl: "/exit-navigation",

      alertPhone: DEFAULT_SUPPORT_ALERT_PHONE,
      inlineAlertText: DEFAULT_SUPPORT_ALERT_TEXT,

      drawerButtonLabel: "Send request",
      browseButtonLabel: "Services",

      browseTitle: "Services",
      browseDescription: "Find the right department and contact method quickly.",

      drawerTitle: "Send a request",
      drawerDescription: "Non-urgent support and after-hours requests.",

      status: DEFAULT_SUPPORT_STATUS,
      services: DEFAULT_SUPPORT_SERVICES,
    } satisfies SupportPageContent,
  },

  safety: {
    title: "Safety",
    contentTable: "safety_content",
    auditTable: "safety_audit",
    defaultContent: {
      eyebrow: "Safety Hub",
      heroTitle: "Staying safe on campus",
      heroDescription:
        "Practical guidance, key contacts, and the fastest actions to take when something feels wrong.",

      stripEmergencyLabel: "Call 999",
      stripSecurityLabel: "Call Security",
      stripReportLabel: "Report",

      emergencyNumber: "999",
      securityNumber: "082260607",
      reportUrl: "/support",
      reportLabel: "Report issue",

      itHelpEmail: "helpdesk@swinburne.edu.my",
      itHelpLabel: "Email IT Help",

      quickNote:
        "If there is immediate danger, injury, smoke, fire, or a serious security concern: call first and move to a safer place.",

      sectionsTitle: "Safety guidance",
      sectionsSubtitle:
        "Simple practical guidance for common situations on campus.",
      sections: [
        {
          id: "personal-safety",
          group: "Personal Safety",
          title: "If you feel unsafe",
          text: "Move to a busy or well-lit place, contact Campus Security, and avoid being alone if possible.",
          link: "/security-contact",
          linkLabel: "Open contacts",
        },
        {
          id: "medical-help",
          group: "Medical",
          title: "If someone is injured",
          text: "Call emergency services for serious injury, then seek campus help and keep the person calm if it is safe to stay nearby.",
          link: "/emergency",
          linkLabel: "Emergency page",
        },
        {
          id: "fire-smoke",
          group: "Fire & Evacuation",
          title: "If there is fire or smoke",
          text: "Evacuate immediately, do not use lifts, and use exit navigation if you need help finding the nearest route.",
          link: "/exit-navigation",
          linkLabel: "Find exit",
        },
      ],

      feedbackHeading: "Need extra help?",
      feedbackDescription:
        "Use the support page to report an issue, request help, or find the right campus service.",
      feedbackButtonText: "Open support",
      feedbackButtonHref: "/support",
    } satisfies SafetyContent,
  },

  emergency: {
    title: "Emergency",
    contentTable: "emergency_content",
    auditTable: "emergency_audit",
    defaultContent: {
      eyebrow: "Safety Hub",
      heroTitle: "Get help fast",
      heroDescription:
        "If it’s urgent: call security or 999 first. Then use exit navigation if you need to evacuate.",

      stripCallSecurityLabel: "Call Security",
      stripCall999Label: "Call 999",
      stripFindExitLabel: "Find Exit",

      emergencyLabel: "Campus Security",
      emergencyTel: "082260607",
      emergencySubtitle: "Immediate help on campus",

      exitNavLabel: "Exit Navigation",
      exitNavUrl: "/exit-navigation",
      exitNavSubtitle: "Use during evacuation",

      secondaryLinkLabel: "Need more numbers? Open Emergency Contacts",
      secondaryLinkHref: "/security-contact",

      alertText:
        "If there is immediate danger, injury, smoke, fire, or a serious security concern: call first and move to a safer location.",

      quickSectionTitle: "What’s happening?",
      quickSectionSubtitle:
        "Pick the closest situation. We’ll take you to the right place.",
      quickTiles: [
        {
          icon: "userShield",
          title: "I feel unsafe",
          subtitle:
            "Suspicious person, harassment, threats, after-hours concerns.",
          href: "/security-contact",
        },
        {
          icon: "firstAid",
          title: "Medical / injury",
          subtitle: "First aid guidance and what to do before help arrives.",
          href: "/safety",
        },
        {
          icon: "fireExtinguisher",
          title: "Fire / smoke",
          subtitle: "Evacuate safely, use exits, and follow fire guidance.",
          href: "/safety",
        },
        {
          icon: "comments",
          title: "Non-urgent help / report",
          subtitle: "Report issues, request help, browse FAQs and services.",
          href: "/support",
        },
      ],

      moreHelpTitle: "More help & info",
      moreHelpSubtitle: "Other useful pages in the Safety Hub.",
      moreHelpCards: [
        {
          icon: "shield",
          title: "Emergency Contacts",
          description: "More campus and public emergency numbers in one place.",
          href: "/security-contact",
        },
        {
          icon: "fireExtinguisher",
          title: "What to do",
          description:
            "Fire, medical, weather, labs, personal safety, and more.",
          href: "/safety",
        },
        {
          icon: "comments",
          title: "Get Help / Report",
          description: "Non-urgent support, reporting, and FAQs.",
          href: "/support",
        },
        {
          icon: "door",
          title: "Find Exit",
          description: "Open the nearest safe exit route from your location.",
          href: "/exit-navigation",
        },
      ],

      howToTitle: "How to use this hub",
      howToSubtitle: "Simple order: action first, information second.",
      howToSteps: [
        {
          title: "1) Call first",
          text: "For urgent situations, call Campus Security or 999 immediately.",
        },
        {
          title: "2) Exit if needed",
          text: "If the area is unsafe, use Find Exit to evacuate quickly.",
        },
        {
          title: "3) Get help / report",
          text: "For non-urgent issues, use Get Help / Report to contact services or submit requests.",
        },
      ],
    } satisfies EmergencyContent,
  },
} as const;

export function isCmsPageSlug(value: string): value is CmsPageSlug {
  return value in CMS_PAGE_CONFIG;
}

export function getCmsPageConfig(slug: string) {
  if (!isCmsPageSlug(slug)) return null;
  return CMS_PAGE_CONFIG[slug];
}

export function cloneCmsContent<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
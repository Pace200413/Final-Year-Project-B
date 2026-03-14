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

export type SafetyContentRow = {
  id: string;
  eyebrow: string;
  hero_title: string;
  hero_description: string;

  strip_emergency_label: string;
  strip_security_label: string;
  strip_report_label: string;

  emergency_number: string;
  security_number: string;
  report_url: string;
  report_label: string;

  it_help_email: string;
  it_help_label: string;

  quick_note: string;

  sections_title: string;
  sections_subtitle: string;
  sections: unknown;

  feedback_heading: string;
  feedback_description: string;
  feedback_button_text: string;
  feedback_button_href: string;

  updated_at?: string;
  updated_by_auth_user_id?: string | null;
  updated_by_email?: string | null;
};

export const DEFAULT_SAFETY_CONTENT: SafetyContent = {
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
  sectionsSubtitle: "Simple practical guidance for common situations on campus.",
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
};

export function normalizeSafetyContent(
  input?: Partial<SafetyContent> | null
): SafetyContent {
  const src = input ?? {};

  return {
    ...DEFAULT_SAFETY_CONTENT,
    ...src,
    sections:
      Array.isArray(src.sections) && src.sections.length > 0
        ? src.sections
        : DEFAULT_SAFETY_CONTENT.sections,
  };
}

export function rowToSafetyContent(
  row?: Partial<SafetyContentRow> | null
): SafetyContent {
  if (!row) return DEFAULT_SAFETY_CONTENT;

  return normalizeSafetyContent({
    eyebrow: row.eyebrow,
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,

    stripEmergencyLabel: row.strip_emergency_label,
    stripSecurityLabel: row.strip_security_label,
    stripReportLabel: row.strip_report_label,

    emergencyNumber: row.emergency_number,
    securityNumber: row.security_number,
    reportUrl: row.report_url,
    reportLabel: row.report_label,

    itHelpEmail: row.it_help_email,
    itHelpLabel: row.it_help_label,

    quickNote: row.quick_note,

    sectionsTitle: row.sections_title,
    sectionsSubtitle: row.sections_subtitle,
    sections: (row.sections as SafetyContentSection[]) ?? undefined,

    feedbackHeading: row.feedback_heading,
    feedbackDescription: row.feedback_description,
    feedbackButtonText: row.feedback_button_text,
    feedbackButtonHref: row.feedback_button_href,
  });
}

export function contentToSafetyRow(content: SafetyContent) {
  return {
    eyebrow: content.eyebrow,
    hero_title: content.heroTitle,
    hero_description: content.heroDescription,

    strip_emergency_label: content.stripEmergencyLabel,
    strip_security_label: content.stripSecurityLabel,
    strip_report_label: content.stripReportLabel,

    emergency_number: content.emergencyNumber,
    security_number: content.securityNumber,
    report_url: content.reportUrl,
    report_label: content.reportLabel,

    it_help_email: content.itHelpEmail,
    it_help_label: content.itHelpLabel,

    quick_note: content.quickNote,

    sections_title: content.sectionsTitle,
    sections_subtitle: content.sectionsSubtitle,
    sections: content.sections,

    feedback_heading: content.feedbackHeading,
    feedback_description: content.feedbackDescription,
    feedback_button_text: content.feedbackButtonText,
    feedback_button_href: content.feedbackButtonHref,
  };
}

export function diffSafetyFields(before: SafetyContent, after: SafetyContent) {
  const changed: string[] = [];

  (Object.keys(DEFAULT_SAFETY_CONTENT) as Array<keyof SafetyContent>).forEach(
    (key) => {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changed.push(String(key));
      }
    }
  );

  return changed;
}
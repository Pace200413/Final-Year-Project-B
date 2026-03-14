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

export type EmergencyContentRow = {
  id: string;
  eyebrow: string;
  hero_title: string;
  hero_description: string;

  strip_call_security_label: string;
  strip_call_999_label: string;
  strip_find_exit_label: string;

  emergency_label: string;
  emergency_tel: string;
  emergency_subtitle: string;

  exit_nav_label: string;
  exit_nav_url: string;
  exit_nav_subtitle: string;

  secondary_link_label: string;
  secondary_link_href: string;

  alert_text: string;

  quick_section_title: string;
  quick_section_subtitle: string;
  quick_tiles: unknown;

  more_help_title: string;
  more_help_subtitle: string;
  more_help_cards: unknown;

  how_to_title: string;
  how_to_subtitle: string;
  how_to_steps: unknown;

  updated_at?: string;
  updated_by_auth_user_id?: string | null;
  updated_by_email?: string | null;
};

export const DEFAULT_EMERGENCY_CONTENT: EmergencyContent = {
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
};

export function normalizeEmergencyContent(
  input?: Partial<EmergencyContent> | null
): EmergencyContent {
  const src = input ?? {};

  return {
    ...DEFAULT_EMERGENCY_CONTENT,
    ...src,
    quickTiles:
      Array.isArray(src.quickTiles) && src.quickTiles.length > 0
        ? src.quickTiles
        : DEFAULT_EMERGENCY_CONTENT.quickTiles,
    moreHelpCards:
      Array.isArray(src.moreHelpCards) && src.moreHelpCards.length > 0
        ? src.moreHelpCards
        : DEFAULT_EMERGENCY_CONTENT.moreHelpCards,
    howToSteps:
      Array.isArray(src.howToSteps) && src.howToSteps.length > 0
        ? src.howToSteps
        : DEFAULT_EMERGENCY_CONTENT.howToSteps,
  };
}

export function rowToEmergencyContent(
  row?: Partial<EmergencyContentRow> | null
): EmergencyContent {
  if (!row) return DEFAULT_EMERGENCY_CONTENT;

  return normalizeEmergencyContent({
    eyebrow: row.eyebrow,
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,

    stripCallSecurityLabel: row.strip_call_security_label,
    stripCall999Label: row.strip_call_999_label,
    stripFindExitLabel: row.strip_find_exit_label,

    emergencyLabel: row.emergency_label,
    emergencyTel: row.emergency_tel,
    emergencySubtitle: row.emergency_subtitle,

    exitNavLabel: row.exit_nav_label,
    exitNavUrl: row.exit_nav_url,
    exitNavSubtitle: row.exit_nav_subtitle,

    secondaryLinkLabel: row.secondary_link_label,
    secondaryLinkHref: row.secondary_link_href,

    alertText: row.alert_text,

    quickSectionTitle: row.quick_section_title,
    quickSectionSubtitle: row.quick_section_subtitle,
    quickTiles: (row.quick_tiles as EmergencyQuickTile[]) ?? undefined,

    moreHelpTitle: row.more_help_title,
    moreHelpSubtitle: row.more_help_subtitle,
    moreHelpCards: (row.more_help_cards as EmergencyMoreHelpCard[]) ?? undefined,

    howToTitle: row.how_to_title,
    howToSubtitle: row.how_to_subtitle,
    howToSteps: (row.how_to_steps as EmergencyHowToStep[]) ?? undefined,
  });
}

export function contentToRow(content: EmergencyContent) {
  return {
    eyebrow: content.eyebrow,
    hero_title: content.heroTitle,
    hero_description: content.heroDescription,

    strip_call_security_label: content.stripCallSecurityLabel,
    strip_call_999_label: content.stripCall999Label,
    strip_find_exit_label: content.stripFindExitLabel,

    emergency_label: content.emergencyLabel,
    emergency_tel: content.emergencyTel,
    emergency_subtitle: content.emergencySubtitle,

    exit_nav_label: content.exitNavLabel,
    exit_nav_url: content.exitNavUrl,
    exit_nav_subtitle: content.exitNavSubtitle,

    secondary_link_label: content.secondaryLinkLabel,
    secondary_link_href: content.secondaryLinkHref,

    alert_text: content.alertText,

    quick_section_title: content.quickSectionTitle,
    quick_section_subtitle: content.quickSectionSubtitle,
    quick_tiles: content.quickTiles,

    more_help_title: content.moreHelpTitle,
    more_help_subtitle: content.moreHelpSubtitle,
    more_help_cards: content.moreHelpCards,

    how_to_title: content.howToTitle,
    how_to_subtitle: content.howToSubtitle,
    how_to_steps: content.howToSteps,
  };
}

export function diffEmergencyFields(
  before: EmergencyContent,
  after: EmergencyContent
) {
  const changed: string[] = [];

  (Object.keys(DEFAULT_EMERGENCY_CONTENT) as Array<keyof EmergencyContent>).forEach(
    (key) => {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changed.push(String(key));
      }
    }
  );

  return changed;
}
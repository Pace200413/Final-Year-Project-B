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

export type SecurityContactContentRow = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;

  strip_call_security_label: string;
  strip_call_999_label: string;
  strip_find_exit_label: string;

  back_to_hub_label: string;
  back_to_hub_href: string;

  alert_text: string;

  steps_title: string;
  steps_subtitle: string;
  steps: unknown;

  exit_title: string;
  exit_subtitle: string;
  exit_location_text: string;
  exit_nearest_text: string;
  exit_link_text: string;
  exit_link_href: string;
  exit_nav_url: string;

  contacts_title: string;
  contacts_subtitle: string;
  contacts: unknown;

  bottom_cards: unknown;

  updated_at?: string;
  updated_by_auth_user_id?: string | null;
  updated_by_email?: string | null;
};

export const DEFAULT_SECURITY_CONTACT_CONTENT: SecurityContactContent = {
  eyebrow: "Safety Hub",
  title: "Emergency Contacts",
  subtitle: "Tap a contact to call. For urgent danger, call Security or 999 first.",

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
    { name: "Campus Security", phone: "082-260-607", isPrimary: true },
    { name: "Emergency Services", phone: "999", isPrimary: false },
    { name: "Health Clinic", phone: "082-260-620", isPrimary: false },
  ],

  bottomCards: [
    {
      title: "What to do",
      description: "Step-by-step guidance for fire, medical, weather, personal safety, and more.",
      href: "/safety",
    },
    {
      title: "Get Help / Report",
      description: "Non-urgent support, reporting, service contacts, and FAQs.",
      href: "/support",
    },
  ],
};

export function normalizeSecurityContactContent(
  input?: Partial<SecurityContactContent> | null
): SecurityContactContent {
  const src = input ?? {};

  return {
    ...DEFAULT_SECURITY_CONTACT_CONTENT,
    ...src,
    steps:
      Array.isArray(src.steps) && src.steps.length > 0
        ? src.steps
        : DEFAULT_SECURITY_CONTACT_CONTENT.steps,
    contacts:
      Array.isArray(src.contacts) && src.contacts.length > 0
        ? src.contacts
        : DEFAULT_SECURITY_CONTACT_CONTENT.contacts,
    bottomCards:
      Array.isArray(src.bottomCards) && src.bottomCards.length > 0
        ? src.bottomCards
        : DEFAULT_SECURITY_CONTACT_CONTENT.bottomCards,
  };
}

export function rowToSecurityContactContent(
  row?: Partial<SecurityContactContentRow> | null
): SecurityContactContent {
  if (!row) return DEFAULT_SECURITY_CONTACT_CONTENT;

  return normalizeSecurityContactContent({
    eyebrow: row.eyebrow,
    title: row.title,
    subtitle: row.subtitle,

    stripCallSecurityLabel: row.strip_call_security_label,
    stripCall999Label: row.strip_call_999_label,
    stripFindExitLabel: row.strip_find_exit_label,

    backToHubLabel: row.back_to_hub_label,
    backToHubHref: row.back_to_hub_href,

    alertText: row.alert_text,

    stepsTitle: row.steps_title,
    stepsSubtitle: row.steps_subtitle,
    steps: (row.steps as SecurityContactStep[]) ?? undefined,

    exitTitle: row.exit_title,
    exitSubtitle: row.exit_subtitle,
    exitLocationText: row.exit_location_text,
    exitNearestText: row.exit_nearest_text,
    exitLinkText: row.exit_link_text,
    exitLinkHref: row.exit_link_href,
    exitNavUrl: row.exit_nav_url,

    contactsTitle: row.contacts_title,
    contactsSubtitle: row.contacts_subtitle,
    contacts: (row.contacts as SecurityContactItem[]) ?? undefined,

    bottomCards: (row.bottom_cards as SecurityContactBottomCard[]) ?? undefined,
  });
}

export function contentToSecurityContactRow(content: SecurityContactContent) {
  return {
    eyebrow: content.eyebrow,
    title: content.title,
    subtitle: content.subtitle,

    strip_call_security_label: content.stripCallSecurityLabel,
    strip_call_999_label: content.stripCall999Label,
    strip_find_exit_label: content.stripFindExitLabel,

    back_to_hub_label: content.backToHubLabel,
    back_to_hub_href: content.backToHubHref,

    alert_text: content.alertText,

    steps_title: content.stepsTitle,
    steps_subtitle: content.stepsSubtitle,
    steps: content.steps,

    exit_title: content.exitTitle,
    exit_subtitle: content.exitSubtitle,
    exit_location_text: content.exitLocationText,
    exit_nearest_text: content.exitNearestText,
    exit_link_text: content.exitLinkText,
    exit_link_href: content.exitLinkHref,
    exit_nav_url: content.exitNavUrl,

    contacts_title: content.contactsTitle,
    contacts_subtitle: content.contactsSubtitle,
    contacts: content.contacts,

    bottom_cards: content.bottomCards,
  };
}

export function diffSecurityContactFields(
  before: SecurityContactContent,
  after: SecurityContactContent
) {
  const changed: string[] = [];

  (Object.keys(DEFAULT_SECURITY_CONTACT_CONTENT) as Array<keyof SecurityContactContent>).forEach(
    (key) => {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changed.push(String(key));
      }
    }
  );

  return changed;
}
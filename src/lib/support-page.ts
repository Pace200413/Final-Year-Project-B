import supportSettings from "@/data/support-settings.json";

export type SupportStatusItem = {
  name: string;
  ok: boolean;
  href?: string;
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

export type SupportPageContentRow = {
  id: string;

  eyebrow: string;
  title: string;
  description: string;

  alert_cta: string | null;
  shortcuts: unknown;
  faqs: unknown;
  routing: unknown;

  back_to_hub_label: string;
  back_to_hub_href: string;

  strip_call_security_label: string;
  strip_call_999_label: string;
  strip_find_exit_label: string;
  exit_nav_url: string;

  alert_phone: string;
  inline_alert_text: string;

  drawer_button_label: string;
  browse_button_label: string;

  browse_title: string;
  browse_description: string;

  drawer_title: string;
  drawer_description: string;

  status: unknown;
  services: unknown;

  updated_at?: string;
  updated_by_auth_user_id?: string | null;
  updated_by_email?: string | null;
};

export const DEFAULT_SUPPORT_PAGE_CONTENT: SupportPageContent = {
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
};

export function normalizeSupportPageContent(
  input?: Partial<SupportPageContent> | null
): SupportPageContent {
  const src = input ?? {};

  return {
    ...DEFAULT_SUPPORT_PAGE_CONTENT,
    ...src,
    status:
      Array.isArray(src.status) && src.status.length > 0
        ? src.status
        : DEFAULT_SUPPORT_PAGE_CONTENT.status,
    services: Array.isArray(src.services)
      ? src.services
      : DEFAULT_SUPPORT_PAGE_CONTENT.services,
    shortcuts: Array.isArray(src.shortcuts)
      ? src.shortcuts
      : DEFAULT_SUPPORT_PAGE_CONTENT.shortcuts,
    faqs: Array.isArray(src.faqs)
      ? src.faqs
      : DEFAULT_SUPPORT_PAGE_CONTENT.faqs,
    routing:
      src.routing && typeof src.routing === "object"
        ? src.routing
        : DEFAULT_SUPPORT_PAGE_CONTENT.routing,
  };
}

export function rowToSupportPageContent(
  row?: Partial<SupportPageContentRow> | null
): SupportPageContent {
  if (!row) return DEFAULT_SUPPORT_PAGE_CONTENT;

  return normalizeSupportPageContent({
    eyebrow: row.eyebrow,
    title: row.title,
    description: row.description,

    alertCta: row.alert_cta ?? DEFAULT_SUPPORT_ALERT_CTA,
    shortcuts: (row.shortcuts as unknown[]) ?? undefined,
    faqs: (row.faqs as unknown[]) ?? undefined,
    routing: (row.routing as Record<string, string>) ?? undefined,

    backToHubLabel: row.back_to_hub_label,
    backToHubHref: row.back_to_hub_href,

    stripCallSecurityLabel: row.strip_call_security_label,
    stripCall999Label: row.strip_call_999_label,
    stripFindExitLabel: row.strip_find_exit_label,
    exitNavUrl: row.exit_nav_url,

    alertPhone: row.alert_phone,
    inlineAlertText: row.inline_alert_text,

    drawerButtonLabel: row.drawer_button_label,
    browseButtonLabel: row.browse_button_label,

    browseTitle: row.browse_title,
    browseDescription: row.browse_description,

    drawerTitle: row.drawer_title,
    drawerDescription: row.drawer_description,

    status: (row.status as SupportStatusItem[]) ?? undefined,
    services: (row.services as unknown[]) ?? undefined,
  });
}

export function contentToSupportPageRow(content: SupportPageContent) {
  return {
    eyebrow: content.eyebrow,
    title: content.title,
    description: content.description,

    alert_cta: content.alertCta,
    shortcuts: content.shortcuts,
    faqs: content.faqs,
    routing: content.routing,

    back_to_hub_label: content.backToHubLabel,
    back_to_hub_href: content.backToHubHref,

    strip_call_security_label: content.stripCallSecurityLabel,
    strip_call_999_label: content.stripCall999Label,
    strip_find_exit_label: content.stripFindExitLabel,
    exit_nav_url: content.exitNavUrl,

    alert_phone: content.alertPhone,
    inline_alert_text: content.inlineAlertText,

    drawer_button_label: content.drawerButtonLabel,
    browse_button_label: content.browseButtonLabel,

    browse_title: content.browseTitle,
    browse_description: content.browseDescription,

    drawer_title: content.drawerTitle,
    drawer_description: content.drawerDescription,

    status: content.status,
    services: content.services,
  };
}

export function diffSupportPageFields(
  before: SupportPageContent,
  after: SupportPageContent
) {
  const changed: string[] = [];

  (Object.keys(DEFAULT_SUPPORT_PAGE_CONTENT) as Array<keyof SupportPageContent>).forEach(
    (key) => {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changed.push(String(key));
      }
    }
  );

  return changed;
}
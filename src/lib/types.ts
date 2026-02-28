export type Status = "Operational" | "Degraded" | "Outage" | "Maintenance";

export type Banner = {
  id: string; title: string; message: string;
  startAt: string; endAt?: string | null;
  campuses: string[]; active: boolean;
};

export type Incident = {
  id: string; service: string; status: Status; title: string;
  note?: string; at: string;
};

export type Service = {
  id: string; name: string; owner?: string; status: Status;
  dependencies: string[]; incidentsOpen: number;
};

export type AuditLog = { id: string; ts: string; who: string; what: string };

// ---- Events ----
export type EventCategory =
  | "Orientation" | "Workshop" | "Club" | "Talk" | "Sports"
  | "Careers" | "Student Life" | "Other" | (string & {});

export type EventVenue = { building: string; level?: string; room?: string; };
export type EventImages = { hero?: string; thumbnail?: string };
export type EventPricing =
  | { type: "free"; currency?: string }
  | { type: "paid"; currency?: string; amount: number };
export type EventRegistration =
  | { type: "none" }
  | { type: "link"; url: string; deadline?: string }
  | { type: "form"; deadline?: string };

export type CampusEvent = {
  id: string; title: string; category: EventCategory;
  date: string; endDate?: string;
  venue: EventVenue; lat?: number; lng?: number;
  organizer?: string; description?: string; images?: EventImages;
  tags?: string[]; capacity?: number; pricing?: EventPricing;
  registration?: EventRegistration; accessibility?: string[];
  isPublished?: boolean; createdAt?: string; updatedAt?: string;
};

// --- Exit Navigation ---
export type ExitStatus = "Open" | "Closed" | "Under Maintenance";

export type ExitSettings = {
  emergencyNumber: string;   // "999"
  ctaLink: string;           // "/exit-navigation"
  defaultLocation: string;   // "ADM Building, Level 2"
  pickFirstOpen: boolean;
  showClosed: boolean;
  showSearch: boolean;
};

export type ExitRecord = {
  id: string; name: string; location: string;
  distance: string;           // "45m"
  estimatedTime: string;      // "1 minute"
  direction: string;          // free text
  status: ExitStatus;
  priority: number;           // 1 = highest
  lat?: number; lng?: number;
};


// --- Safety (Staying Safe on Campus) ---
export type SafetyQuickLink = { label: string; href: string };
export type SafetyFeedback = {
  heading: string;
  description: string;
  buttonText: string;
  buttonHref: string;
};
export type SafetySettings = {
  // top bar buttons
  emergencyLabel: string;   // e.g. "Emergency 999"
  emergencyTel: string;     // e.g. "999"
  exitNavLabel: string;     // e.g. "Go to Exit Navigation"
  exitNavUrl: string;       // e.g. "/exit-navigation"

  // header
  title: string;            // "Staying Safe on Campus"
  subtitle: string;         // "Practical guidance..."

  // quick links (fixed 3)
  quickLinks: [SafetyQuickLink, SafetyQuickLink, SafetyQuickLink];

  // feedback block
  feedback: SafetyFeedback;
};

// --- Security & Emergency ---
export type SecExitGuide = {
  locationText: string;
  nearestExitText: string;
  linkText: string;
  linkHref: string;
};
export type SecContact = { name: string; phone: string };
export type SecBottomCard = { title: string; description: string; href: string; linkText?: string };

export type SecuritySettings = {
  // top bar
  emergencyLabel: string;   // "Emergency 999"
  emergencyTel: string;     // "999"
  exitNavLabel: string;     // "Go to Exit Navigation"
  exitNavUrl: string;       // "/exit-navigation"

  // header + alert
  title: string;            // "Security & Emergency"
  subtitle: string;         // "Campus emergency resources…"
  alertText: string;        // banner message

  // guide + contacts + cards
  exitGuide: SecExitGuide;
  contacts: SecContact[];   // Campus Security, Emergency, Clinic, etc.
  bottomCards: SecBottomCard[]; // ["Safety Protocols", "Exit Navigation"]
};

// --- Navigation (admin-managed cards) ---
export type NavCardHours = { open: string; close: string };

export type NavCard = {
  id: string;
  title: string;
  hint?: string;
  href: string;
  icon?: 'map' | 'dining' | 'study' | 'hq' | 'mph' | 'hub' | 'library' | 'parking';
  order: number;
  enabled: boolean;
  hours?: NavCardHours | null;
  stallsCount?: number;
  description?: string;
};

export type SupportRequest = {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  createdAt: string;
  status: "new" | "in_progress" | "closed";
};
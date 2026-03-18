/**
 * Shared types for the campus assistant (API and UI).
 * Used by: src/app/api/assistant/route.ts, src/components/AssistantChat.tsx
 */

export type Action =
  | { type: "OPEN_SUPPORT"; label: string }
  | { type: "OPEN_NAVIGATION"; label: string; placeId?: string }
  | { type: "OPEN_ROUTE"; label: string; value: string }
  | { type: "OPEN_LINK"; label: string; value: string }
  | { type: "CALL_PHONE"; label: string; value: string }
  | { type: "CALL_SECURITY"; label: string }
  | { type: "COPY_CONTACT"; label: string; value: string };

export type Topic =
  | "navigation"
  | "wifi"
  | "canvas"
  | "student_portal"
  | "fees"
  | "visa"
  | "passport"
  | "safety"
  | "research"
  | "support"
  | "unknown";

export type Goal =
  | "overview"
  | "setup"
  | "not_working"
  | "login"
  | "deadline"
  | "payment_method"
  | "instalment"
  | "renewal"
  | "new_application"
  | "lost_document"
  | "cancellation"
  | "contact"
  | "location"
  | "navigate"
  | "clarify"
  | null;

export type Interpretation = {
  topic: Topic;
  goal: Goal;
  greeting: boolean;
  followUp: boolean;
  needsClarification: boolean;
  name?: string | null;
  place?: string | null;
  department?: string | null;
  device?: "mobile" | "laptop" | null;
  dateISO?: string | null;
};

export type HistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type StructuredEntry = {
  id: string;
  title: string;
  aliases?: string[];
  category: string;
  answer: string;
  actions?: Action[];
  sourceLabel?: string;
};

export type AssistantResponse = {
  reply: string;
  sources: string[];
  actions: Action[];
  suggestedPlaces?: { placeId: string; name: string }[];
  suggestedChips?: { label: string; targetEntryId: string }[];
  currentTopic: Topic | null;
  debug?: unknown;
};

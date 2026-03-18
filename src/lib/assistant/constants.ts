/**
 * Shared constants for the campus assistant.
 * Used by: src/app/api/assistant/route.ts
 */

export const FOLLOWUP_CHIPS: Record<string, { label: string; targetEntryId: string }[]> = {
  fees: [
    { label: "Fee deadline", targetEntryId: "tuition_fee_due_date" },
    { label: "How to pay", targetEntryId: "pay_fees_malaysian" },
    { label: "Instalment plan", targetEntryId: "instalment_payment_plan" },
  ],
  visa: [
    { label: "Visa overview", targetEntryId: "visa_overview" },
    { label: "Renew visa", targetEntryId: "renew_student_visa" },
    { label: "Lost passport", targetEntryId: "lost_passport" },
  ],
  safety: [
    { label: "Campus security", targetEntryId: "campus_security_contact" },
    { label: "Red phone numbers", targetEntryId: "red_phone_numbers" },
    { label: "Smoke-free campus", targetEntryId: "smoke_free_campus" },
  ],
  research: [
    { label: "Research contacts", targetEntryId: "research_general_contacts" },
    { label: "Research location", targetEntryId: "research_office_location" },
  ],
  it: [
    { label: "Wi-Fi on phone", targetEntryId: "wifi_eduroam_mobile" },
    { label: "Wi-Fi on laptop", targetEntryId: "wifi_eduroam_laptop" },
    { label: "Wi-Fi not working", targetEntryId: "wifi_not_working" },
  ],
  support: [
    { label: "SIC", targetEntryId: "sic_contact" },
    { label: "Finance", targetEntryId: "finance_treasury_contact" },
    { label: "Visa & Insurance", targetEntryId: "visa_insurance_contact" },
  ],
};

export const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "am",
  "as",
  "at",
  "be",
  "can",
  "do",
  "for",
  "from",
  "go",
  "hello",
  "help",
  "hey",
  "hi",
  "hiii",
  "how",
  "i",
  "im",
  "i'm",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "please",
  "the",
  "to",
  "u",
  "you",
  "what",
  "where",
  "when",
]);

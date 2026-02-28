export type SupportCategory = "IT Support" | "Facilities" | "Safety" | "Wellbeing" | "Academic" | "General";

export type Service = {
  slug: string;
  name: string;
  category: SupportCategory;
  desc: string;
  hours: string;
  phone?: string;
  email?: string;
  location?: string;
  link?: string;
};

export type SupportRequest = {
  id: string;
  name: string;
  email: string;
  category: SupportCategory | string;
  message: string;
  createdAt: string; // ISO
  status: "new" | "in_progress" | "resolved";
};

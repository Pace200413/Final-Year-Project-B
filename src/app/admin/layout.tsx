// src/app/admin/layout.tsx
import type { ReactNode } from "react";
import AdminShell from "@/admin/layouts/AdminShell";

export default function Layout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
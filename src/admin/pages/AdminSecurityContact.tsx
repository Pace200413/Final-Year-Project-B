"use client";

import SimpleJsonCmsEditor from "@/admin/components/SimpleJsonCmsEditor";

export default function AdminSecurityContact() {
  return (
    <SimpleJsonCmsEditor
      slug="security-contact"
      title="Security Contact"
      description="Edit the JSON content for the Security Contact page."
    />
  );
}
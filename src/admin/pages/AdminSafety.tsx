"use client";

import SimpleJsonCmsEditor from "@/admin/components/SimpleJsonCmsEditor";

export default function AdminSafety() {
  return (
    <SimpleJsonCmsEditor
      slug="safety"
      title="Safety"
      description="Edit the JSON content for the Safety page."
    />
  );
}
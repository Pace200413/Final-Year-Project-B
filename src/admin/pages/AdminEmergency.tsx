"use client";

import SimpleJsonCmsEditor from "@/admin/components/SimpleJsonCmsEditor";

export default function AdminEmergency() {
  return (
    <SimpleJsonCmsEditor
      slug="emergency"
      title="Emergency"
      description="Edit the JSON content for the Emergency page."
    />
  );
}
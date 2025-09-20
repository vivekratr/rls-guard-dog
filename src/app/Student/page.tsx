"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import StudentPortal from "@/pages-components/StudentPortal";

export default function TeacherPage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentPortal />
    </ProtectedRoute>
  );
}

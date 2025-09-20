"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import TeacherDashboard from "@/pages-components/TeacherDashboard";

export default function TeacherPage() {
  return (
    <ProtectedRoute allowedRoles={["teacher", "head_teacher"]}>
      <TeacherDashboard />
    </ProtectedRoute>
  );
}

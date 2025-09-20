"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "teacher" | "head_teacher")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        if (profile.role === "student") {
          router.push('/student');
        } else if (profile.role === "teacher" || profile.role === "head_teacher") {
          router.push('/teacher');
        }
      }
    }
  }, [user, profile, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  // Only render children if user has the right role or if no roles are specified
  if (!allowedRoles || allowedRoles.includes(profile.role)) {
    return <>{children}</>;
  }

  // If we get here, the user doesn't have permission but we haven't redirected yet
  // This is a fallback, the useEffect should handle the redirect
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default ProtectedRoute;

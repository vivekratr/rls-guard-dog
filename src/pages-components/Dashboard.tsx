"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  BookOpen,
  Users,
  BarChart3,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// This ensures this component is only rendered on the client side
const isClient = typeof window !== 'undefined';

const Dashboard = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>Loading...</div>; // or a proper loading component
  }

  const handleGetStarted = () => {
    if (user && profile) {
      if (profile.role === "student") {
        window.location.href = "/student";
      } else if (
        profile.role === "teacher" ||
        profile.role === "head_teacher"
      ) {
        window.location.href = "/teacher";
      }
    } else {
      window.location.href = "/register";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                RLS Guard Dog
              </h1>
            </div>
            <div className="flex gap-3">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {profile?.first_name}
                  </span>
                  <Button variant="outline" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-5xl font-bold text-foreground">
            Secure Classroom Progress Tracking
          </h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Advanced row-level security ensures each student, teacher, and
            administrator sees only what they're authorized to access. Built
            with Supabase RLS and modern security practices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user && profile ? (
              <Button size="lg" onClick={handleGetStarted}>
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/teacher">
                    Teacher Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/student">
                    Student Portal <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold">
            Security-First Education Platform
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-6">
              <Shield className="mb-4 h-12 w-12 text-primary" />
              <h4 className="mb-2 text-xl font-semibold">Row-Level Security</h4>
              <p className="text-muted-foreground">
                Supabase RLS ensures students only see their data, teachers
                access their classes, and administrators manage school-wide
                information.
              </p>
            </Card>
            <Card className="p-6">
              <BookOpen className="mb-4 h-12 w-12 text-accent" />
              <h4 className="mb-2 text-xl font-semibold">Progress Tracking</h4>
              <p className="text-muted-foreground">
                Real-time progress monitoring with detailed analytics and
                reporting for students, classes, and entire schools.
              </p>
            </Card>
            <Card className="p-6">
              <BarChart3 className="mb-4 h-12 w-12 text-success" />
              <h4 className="mb-2 text-xl font-semibold">Advanced Analytics</h4>
              <p className="text-muted-foreground">
                MongoDB-powered analytics with Edge Functions for aggregate data
                and performance insights across all educational levels.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="mb-12 text-center text-3xl font-bold">
          Role-Based Access Control
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 border-l-4 border-l-accent">
            <Users className="mb-4 h-8 w-8 text-accent" />
            <h4 className="mb-2 text-lg font-semibold">Students</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              View and update only your own progress records with complete
              privacy protection.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/student">Student Portal</Link>
            </Button>
          </Card>
          <Card className="p-6 border-l-4 border-l-primary">
            <BookOpen className="mb-4 h-8 w-8 text-primary" />
            <h4 className="mb-2 text-lg font-semibold">Teachers</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Manage progress for students in your assigned classes with secure
              access controls.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/teacher">Teacher Dashboard</Link>
            </Button>
          </Card>
          <Card className="p-6 border-l-4 border-l-warning">
            <Shield className="mb-4 h-8 w-8 text-warning" />
            <h4 className="mb-2 text-lg font-semibold">Head Teachers</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              School-wide visibility with complete analytics and administrative
              controls.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">Admin Panel</Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold">RLS Guard Dog</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Secure classroom progress tracking with Supabase RLS, Next.js, and
            MongoDB analytics.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

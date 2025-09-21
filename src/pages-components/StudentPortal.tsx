import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Clock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const StudentPortal = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchStudentEnrollments();
    }
  }, [user]);

  const fetchStudentEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from("student_enrollments")
        .select(
          `
          id,
          student_id,
          class_id,
          progress,
          status,
          last_activity,
          enrolled_at
        `
        )
        .eq("student_id", user?.id)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;

      // Fetch class and teacher details separately
      if (data && data.length > 0) {
        const classIds = data.map((enrollment) => enrollment.class_id);
        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select("id, name, description, teacher_id")
          .in("id", classIds);

        if (classesError) throw classesError;

        // Fetch teacher details
        const teacherIds = classesData?.map((c) => c.teacher_id) || [];
        const { data: teachersData, error: teachersError } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", teacherIds);

        if (teachersError) throw teachersError;

        // Combine the data
        const formattedEnrollments = data.map((enrollment) => {
          const classData = classesData?.find(
            (c) => c.id === enrollment.class_id
          );
          const teacherData = teachersData?.find(
            (t) => t.user_id === classData?.teacher_id
          );

          return {
            ...enrollment,
            class: {
              name: classData?.name || "Unknown Class",
              description: classData?.description || "",
              teacher: {
                first_name: teacherData?.first_name || "Unknown",
                last_name: teacherData?.last_name || "Teacher",
              },
            },
          };
        });

        setEnrollments(formattedEnrollments);
      } else {
        setEnrollments([]);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch your enrollments",
      });
    } finally {
      setLoading(false);
    }
  };

  const recentAchievements = [
    { title: "Perfect Attendance", icon: Calendar, color: "success" },
    { title: "Top 5 Student", icon: Award, color: "warning" },
    { title: "Assignment Streak", icon: Target, color: "primary" },
  ];

  const getGradeColor = (progress: number) => {
    if (progress >= 90) return "success";
    if (progress >= 80) return "secondary";
    if (progress >= 60) return "warning";
    return "destructive";
  };

  const getGradeFromProgress = (progress: number) => {
    if (progress >= 97) return "A+";
    if (progress >= 93) return "A";
    if (progress >= 90) return "A-";
    if (progress >= 87) return "B+";
    if (progress >= 83) return "B";
    if (progress >= 80) return "B-";
    if (progress >= 77) return "C+";
    if (progress >= 73) return "C";
    if (progress >= 70) return "C-";
    if (progress >= 60) return "D";
    return "F";
  };

  const formatLastActivity = (timestamp: string) => {
    if (!timestamp) return "No activity";

    const now = new Date();
    const activity = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - activity.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  const calculateOverallProgress = () => {
    if (enrollments.length === 0) return 0;
    return Math.round(
      enrollments.reduce(
        (sum, enrollment) => sum + (enrollment.progress || 0),
        0
      ) / enrollments.length
    );
  };

  const overallProgress = calculateOverallProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-2xl font-bold text-primary">
                RLS Guard Dog
              </Link>
              <Badge variant="outline">Student Portal</Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.first_name} {profile?.last_name}
              </span>
              <Button variant="ghost" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.first_name}!
          </h1>
          <p className="text-muted-foreground">
            Here's your progress overview and upcoming assignments.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overall Progress
                </p>
                <p className="text-2xl font-bold">{overallProgress}%</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Award className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Enrolled Classes
                </p>
                <p className="text-2xl font-bold">{enrollments.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Classes
                </p>
                <p className="text-2xl font-bold">
                  {enrollments.filter((e) => e.status === "active").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Target className="h-8 w-8 text-accent" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Grade
                </p>
                <p className="text-2xl font-bold">
                  {getGradeFromProgress(overallProgress)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Subjects Progress */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">My Classes</h2>
              <div className="space-y-4">
                {enrollments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    You are not enrolled in any classes yet.
                  </div>
                ) : (
                  enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">
                            {enrollment.class.name}
                          </h3>
                          <Badge
                            variant={getGradeColor(enrollment.progress || 0)}
                          >
                            {getGradeFromProgress(enrollment.progress || 0)}
                          </Badge>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                        <Progress
                          value={enrollment.progress || 0}
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            Teacher: {enrollment.class.teacher?.first_name}{" "}
                            {enrollment.class.teacher?.last_name}
                          </span>
                          <span>
                            {formatLastActivity(enrollment.last_activity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Class Status */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Class Status</h2>
              <div className="space-y-3">
                {enrollments.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No class activities to show.
                  </div>
                ) : (
                  enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{enrollment.class.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Status:{" "}
                          {(enrollment.status || "active").replace("-", " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {enrollment.progress || 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Progress
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Achievements & Progress */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Recent Achievements
              </h2>
              <div className="space-y-3">
                {recentAchievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <Icon className={`h-5 w-5 text-${achievement.color}`} />
                      <span className="text-sm font-medium">
                        {achievement.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Overall Progress</h2>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold mb-2">
                  {overallProgress}%
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {enrollments.length} active enrollment
                  {enrollments.length !== 1 ? "s" : ""}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Detailed Report
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;

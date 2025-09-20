import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, TrendingUp, Calendar, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProgressEntryDialog } from "@/components/ProgressEntryDialog";

const TeacherDashboard = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchEnrollments();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setClasses(data || []);
      if (data && data.length > 0 && !selectedClass) {
        setSelectedClass(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch classes",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    if (!selectedClass) return;

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
        .eq("class_id", selectedClass)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;

      // Fetch student details separately
      if (data && data.length > 0) {
        const studentIds = data.map((enrollment) => enrollment.student_id);
        const { data: studentsData, error: studentsError } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", studentIds);

        if (studentsError) throw studentsError;

        // Combine the data
        const formattedEnrollments = data.map((enrollment) => {
          const student = studentsData?.find(
            (s) => s.user_id === enrollment.student_id
          );
          return {
            ...enrollment,
            student_name: student
              ? `${student.first_name} ${student.last_name}`
              : "Unknown Student",
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
        description: "Failed to fetch student enrollments",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "success";
      case "good":
        return "secondary";
      case "needs-attention":
        return "warning";
      case "active":
        return "default";
      default:
        return "secondary";
    }
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

  const calculateStats = () => {
    const totalStudents = enrollments.length;
    const avgProgress =
      totalStudents > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
              totalStudents
          )
        : 0;
    const activeToday = enrollments.filter((e) => {
      if (!e.last_activity) return false;
      const today = new Date();
      const activity = new Date(e.last_activity);
      return activity.toDateString() === today.toDateString();
    }).length;

    return { totalStudents, avgProgress, activeToday };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
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
              <Badge variant="outline">Teacher Portal</Badge>
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
        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  My Classes
                </p>
                <p className="text-2xl font-bold">{classes.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-accent" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Progress
                </p>
                <p className="text-2xl font-bold">{stats.avgProgress}%</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Today
                </p>
                <p className="text-2xl font-bold">{stats.activeToday}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedClass} onValueChange={setSelectedClass}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full max-w-md">
              {classes.map((cls) => (
                <TabsTrigger key={cls.id} value={cls.id} className="text-xs">
                  {cls.name.length > 15
                    ? cls.name.substring(0, 15) + "..."
                    : cls.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ProgressEntryDialog
              classId={selectedClass}
              onSuccess={fetchEnrollments}
            />
          </div>

          {classes.map((cls) => (
            <TabsContent key={cls.id} value={cls.id}>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Class Overview */}
                <Card className="lg:col-span-1 p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {cls.name} Overview
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Class Average</span>
                        <span className="font-medium">
                          {stats.avgProgress}%
                        </span>
                      </div>
                      <Progress value={stats.avgProgress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-2xl font-bold text-success">
                          {
                            enrollments.filter((e) => (e.progress || 0) >= 85)
                              .length
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Excellent
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-warning">
                          {
                            enrollments.filter((e) => (e.progress || 0) < 60)
                              .length
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Needs Help
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Student List */}
                <Card className="lg:col-span-2 p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Student Progress
                  </h3>
                  <div className="space-y-4">
                    {enrollments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No students enrolled in this class yet.
                      </div>
                    ) : (
                      enrollments.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium">
                                {enrollment.student_name}
                              </h4>
                              <Badge
                                variant={getStatusColor(
                                  enrollment.status || "active"
                                )}
                                className="text-xs"
                              >
                                {(enrollment.status || "active").replace(
                                  "-",
                                  " "
                                )}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progress</span>
                                  <span>{enrollment.progress || 0}%</span>
                                </div>
                                <Progress
                                  value={enrollment.progress || 0}
                                  className="h-1"
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatLastActivity(enrollment.last_activity)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <ProgressEntryDialog
                              studentEnrollment={{
                                id: enrollment.id,
                                student_id: enrollment.student_id,
                                progress: enrollment.progress || 0,
                                status: enrollment.status || "active",
                                student_name: enrollment.student_name,
                              }}
                              onSuccess={fetchEnrollments}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;

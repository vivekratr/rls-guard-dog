import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit3 } from "lucide-react";

// Define the type for the student enrollment
interface StudentEnrollment {
  id: string;
  student_id: string;
  class_id: string;
  progress: number;
  status: string;
  last_activity: string;
  student_name?: string;
  created_at?: string;
  updated_at?: string;
}

type EnrollmentUpdate = Partial<Pick<StudentEnrollment, 'progress' | 'status' | 'last_activity' | 'updated_at'>>;

interface Student {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
}

interface ProgressEntryDialogProps {
  studentEnrollment?: StudentEnrollment;
  classId?: string;
  onSuccess?: () => void;
}

export const ProgressEntryDialog: React.FC<ProgressEntryDialogProps> = ({
  studentEnrollment,
  classId,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState(
    studentEnrollment?.student_id || ""
  );
  const [progress, setProgress] = useState(
    studentEnrollment?.progress?.toString() || "0"
  );
  const [status, setStatus] = useState(studentEnrollment?.status || "active");
  const [notes, setNotes] = useState("");

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && !studentEnrollment) {
      fetchAvailableStudents();
    }
  }, [open, studentEnrollment]);

  const fetchAvailableStudents = async () => {
    if (!user || !classId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name")
        .eq("role", "student");

      if (error) throw error;
      console.log("students",data,error)
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch students",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to submit progress",
      });
      return;
    }

    setLoading(true);

    try {
      // Using type assertion to any to bypass TypeScript errors
      const updateData = {
        progress: parseFloat(progress),
        status,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (studentEnrollment) {
        // Update existing enrollment
        const { error } = await (supabase)
          .from("student_enrollments")
          .update(updateData)
          .eq("id", studentEnrollment.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Student progress updated successfully",
        });
      } else if (classId) {
        // Create new enrollment or update existing one
        const { error } = await (supabase )
          .from("student_enrollments")
          .upsert({
            student_id: selectedStudentId,
            class_id: classId,
            created_at: new Date().toISOString(),
            ...updateData,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Progress entry added successfully",
        });
      } else {
        throw new Error("Class ID is required");
      }

      setOpen(false);
      onSuccess?.();

      // Reset form
      if (!studentEnrollment) {
        setSelectedStudentId("");
        setProgress("0");
        setStatus("active");
        setNotes("");
      }
    } catch (error) {
      console.error("Error saving progress:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          (error as Error).message || "Failed to save progress entry",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={studentEnrollment ? "ghost" : "default"}
          size={studentEnrollment ? "sm" : "default"}
          className={studentEnrollment ? "p-2" : ""}
          aria-label={studentEnrollment ? "Edit progress" : "Add progress entry"}
        >
          {studentEnrollment ? (
            <Edit3 className="h-4 w-4" />
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Progress Entry
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {studentEnrollment ? "Update Progress" : "Add Progress Entry"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {studentEnrollment 
              ? `Update progress for ${studentEnrollment.student_name || 'this student'}`
              : 'Add a new progress entry for the student'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!studentEnrollment && (
            <div className="space-y-2">
              <Label htmlFor="student">Select Student</Label>
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.user_id} value={student.user_id}>
                      {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {studentEnrollment && (
            <div className="space-y-2">
              <Label>Student</Label>
              <div className="text-sm font-medium p-2 bg-muted rounded">
                {studentEnrollment.student_name}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="needs-attention">Needs Attention</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : studentEnrollment
                ? "Update"
                : "Add Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

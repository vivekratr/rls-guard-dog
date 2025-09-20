import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit3 } from "lucide-react";

interface ProgressEntryDialogProps {
  studentEnrollment?: {
    id: string;
    student_id: string;
    progress: number;
    status: string;
    student_name?: string;
  };
  classId?: string;
  onSuccess?: () => void;
}

export const ProgressEntryDialog = ({
  studentEnrollment,
  classId,
  onSuccess,
}: ProgressEntryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
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
    setLoading(true);

    try {
      if (studentEnrollment) {
        // Update existing enrollment
        const { error } = await supabase
          .from("student_enrollments")
          .update({
            progress: parseFloat(progress),
            status,
            last_activity: new Date().toISOString(),
          })
          .eq("id", studentEnrollment.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Student progress updated successfully",
        });
      } else {
        // Create new enrollment or update existing one
        const { error } = await supabase.from("student_enrollments").upsert({
          student_id: selectedStudentId,
          class_id: classId!,
          progress: parseFloat(progress),
          status,
          last_activity: new Date().toISOString(),
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Progress entry added successfully",
        });
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
    } catch (error: any) {
      console.error("Error saving progress:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save progress entry",
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
          <DialogTitle>
            {studentEnrollment ? "Update Progress" : "Add Progress Entry"}
          </DialogTitle>
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

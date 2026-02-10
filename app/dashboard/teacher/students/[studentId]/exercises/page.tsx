"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Check, Plus, X } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

interface Props {
  params: Promise<{ studentId: string; }>;
}

export default function StudentExercisesPage({ params }: Props) {
  const { studentId } = use(params);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDueDate, setSelectedDueDate] = useState<string>("");

  const { data: studentData, isLoading: studentLoading } = useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const response = await fetch(`/api/teacher/students/${studentId}`);
      if (!response.ok) throw new Error("Failed to fetch student");
      return response.json();
    },
  });

  const { data: exerciseData, isLoading } = useQuery({
    queryKey: ["student-exercises", studentId],
    queryFn: async () => {
      const response = await fetch(`/api/teacher/students/${studentId}/exercises`);
      if (!response.ok) throw new Error("Failed to fetch exercises");
      return response.json();
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ exerciseId, dueDate }: { exerciseId: string; dueDate?: string; }) => {
      const response = await fetch(`/api/teacher/students/${studentId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId, dueDate }),
      });
      if (!response.ok) throw new Error("Failed to assign exercise");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Exercise assigned successfully!",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      queryClient.invalidateQueries({ queryKey: ["student-exercises", studentId] });
      queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
      setSelectedDueDate("");
    },
    onError: () => {
      toast({
        title: "Failed to assign exercise",
        variant: "destructive"
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const response = await fetch(`/api/teacher/students/${studentId}/exercises?exerciseId=${exerciseId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove exercise");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Exercise removed successfully!",
        className: "bg-orange-50 border-orange-200 text-orange-800"
      });
      queryClient.invalidateQueries({ queryKey: ["student-exercises", studentId] });
      queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
    },
    onError: () => {
      toast({
        title: "Failed to remove exercise",
        variant: "destructive"
      });
    },
  });

  const handleAssign = (exerciseId: string) => {
    assignMutation.mutate({
      exerciseId,
      dueDate: selectedDueDate || undefined
    });
  };

  const handleRemove = (exerciseId: string) => {
    removeMutation.mutate(exerciseId);
  };

  if (studentLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading student data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Exercises</h1>
          <p className="text-muted-foreground">
            {studentData?.fullName}
          </p>
        </div>
        <div className="ml-auto mr-8">
          <Link href={`/dashboard/teacher`}>
            <Button size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Exercises */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Assigned Exercises
              <span className="text-sm font-normal text-muted-foreground">
                ({exerciseData?.assigned?.length || 0})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : exerciseData?.assigned?.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No exercises assigned yet
              </div>
            ) : (
              <div className="space-y-4">
                {exerciseData?.assigned?.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{assignment.exercise.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {assignment.exercise.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="capitalize">{assignment.exercise.difficulty}</span>
                          <span>{assignment.exercise.level}</span>
                          {assignment.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(assignment.dueDate).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(assignment.exercise.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Exercises */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Available Exercises
              <span className="text-sm font-normal text-muted-foreground">
                ({exerciseData?.available?.length || 0})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : exerciseData?.available?.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No exercises available to assign
              </div>
            ) : (
              <div className="space-y-4">
                {exerciseData?.available?.map((exercise) => (
                  <div key={exercise.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{exercise.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {exercise.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="capitalize">{exercise.difficulty}</span>
                          <span>{exercise.level}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAssign(exercise.id)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

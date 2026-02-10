"use client";

import '@/lib/ag-grid-config';

import { DashboardNav } from "@/components/dashboard-nav";
import { SubmissionViewDialog } from "@/components/teacher/SubmissionViewDialog";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { ExerciseDifficulty } from '@prisma/client';
import { ExerciseWithRelations, SubmissionDetails, StudentFormData, UserWithRelations } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { CheckCircle, Copy, Eye, FileText, Link2, MoreVertical, Pencil, PlusCircle, Settings, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Props {
  exercises: ExerciseWithRelations[];
  totalSubmissions: number;
  publishedCount: number;
  isAdmin?: boolean;
}

export default function TeacherDashboardClient({ exercises: initialExercises, totalSubmissions, publishedCount, isAdmin = false }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);

  const [submissionViewOpen, setSubmissionViewOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetails | null>(null);
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [editStudentDialogOpen, setEditStudentDialogOpen] = useState(false);
  const [deleteStudentDialogOpen, setDeleteStudentDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<UserWithRelations | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState<StudentFormData>({
    fullName: "",
    email: "",
    level: "",
    isGeneral: true
  });

  const { data: exercises = initialExercises } = useQuery({
    queryKey: ["teacher-exercises"],
    queryFn: async () => {
      const response = await fetch("/api/teacher/exercises");
      if (!response.ok) throw new Error("Failed to fetch exercises");
      return response.json();
    },
    initialData: initialExercises,
  });

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ["teacher-students"],
    queryFn: async () => {
      const response = await fetch("/api/teacher/students");
      if (!response.ok) throw new Error("Failed to fetch students");
      return response.json();
    },
  });

  const { data: recentSubmissions, isLoading: loadingSubmissions } = useQuery({
    queryKey: ["teacher-submissions"],
    queryFn: async () => {
      const response = await fetch("/api/teacher/submissions");
      if (!response.ok) throw new Error("Failed to fetch submissions");
      return response.json();
    },
  });

  const { data: submissionsCount } = useQuery({
    queryKey: ["teacher-submissions-count"],
    queryFn: async () => {
      const response = await fetch("/api/teacher/submissions/count");
      if (!response.ok) throw new Error("Failed to fetch submissions count");
      const data = await response.json();
      return data.count;
    },
    initialData: totalSubmissions,
  });

  const exercisesColumnDefs: ColDef[] = [
    { field: "title", headerName: "Title", flex: 2, filter: true },
    { field: "description", headerName: "Description", flex: 2, filter: true },
    {
      field: "difficulty",
      headerName: "Difficulty",
      flex: 1,
      filter: true,
      cellRenderer: (params: ICellRendererParams<ExerciseWithRelations>) => {
        const difficultyMap = { easy: "Easy", medium: "Medium", hard: "Hard" };
        return difficultyMap[params.value as ExerciseDifficulty] || params.value;
      }
    },
    { field: "level", headerName: "Level", flex: 1, filter: true },
    {
      field: "isGeneral",
      headerName: "Target Audience",
      flex: 1,
      filter: true,
      cellRenderer: (params: ICellRendererParams<ExerciseWithRelations>) => params.value ? "Private" : "Bela Lira"
    },
    {
      field: "isPublished",
      headerName: "Status",
      flex: 1,
      filter: true,
      cellRenderer: (params: ICellRendererParams<ExerciseWithRelations>) => params.value ? "Published" : "Draft"
    },
    {
      headerName: "Actions",
      flex: 1,
      cellRenderer: (params: ICellRendererParams<ExerciseWithRelations>) => (
        <div className="flex items-center justify-center h-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/teacher/exercises/${params.data?.id}/preview`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/teacher/exercises/${params.data?.id}`} className="flex items-center">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center"
                onClick={() => params.data && publishMutation.mutate(params.data.id)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {params.data?.isPublished ? "Unpublish" : "Publish"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center"
                onClick={() => params.data && duplicateMutation.mutate(params.data.id)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center text-red-600"
                onClick={() => {
                  if (params.data) {
                    setExerciseToDelete(params.data.id);
                    setDeleteDialogOpen(true);
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      filter: false
    }
  ];

  const submissionsColumnDefs: ColDef[] = [
    { field: "student.fullName", headerName: "Student", flex: 1, filter: true },
    { field: "exercise.title", headerName: "Exercise", flex: 2, filter: true },
    {
      field: "score",
      headerName: "Score",
      width: 120,
      cellRenderer: (params: ICellRendererParams) => `${params.value}/${params.data.totalQuestions}`,
      cellStyle: { textAlign: 'center' },
      filter: false
    },
    {
      field: "percentage",
      headerName: "Percentage",
      width: 120,
      cellRenderer: (params: ICellRendererParams) => {
        const percentage = Math.round((params.data.score / params.data.totalQuestions) * 100);
        const passed = percentage >= 70;
        return (
          <span className={`inline-flex items-center justify-center w-12 h-6 rounded-full text-xs font-medium ${passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {percentage}%
          </span>
        );
      },
      cellStyle: { textAlign: 'center' },
      filter: false
    },
    {
      field: "createdAt",
      headerName: "Data",
      width: 150,
      cellRenderer: (params: ICellRendererParams) => new Date(params.value as string).toLocaleDateString('pt-BR'),
      cellStyle: { textAlign: 'center' }
    },
    {
      headerName: "Actions",
      width: 100,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex items-center justify-center h-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedSubmission(params.data);
              setSubmissionViewOpen(true);
            }}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
      sortable: false,
      filter: false
    }
  ];

  const studentsColumnDefs: ColDef[] = [
    { field: "fullName", headerName: "Name", flex: 1, filter: true },
    { field: "level", headerName: "Level", flex: 1, filter: true },
    {
      field: "isGeneral",
      headerName: "Target Audience",
      flex: 1,
      filter: true,
      cellRenderer: (params: ICellRendererParams<UserWithRelations>) => params.value ? "Private" : "Bela Lira"
    },
    {
      field: "openExercises",
      headerName: "Open",
      width: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
          {params.value}
        </span>
      ),
      cellStyle: { textAlign: 'center' }
    },
    {
      field: "completedExercises",
      headerName: "Completed",
      width: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-medium">
          {params.value}
        </span>
      ),
      cellStyle: { textAlign: 'center' }
    },
    {
      headerName: "Actions",
      width: 150,
      cellRenderer: (params: ICellRendererParams<UserWithRelations>) => (
        <div className="flex items-center justify-center h-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/teacher/students/${params.data?.id}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/teacher/students/${params.data?.id}/exercises`} className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Exercises
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center"
                onClick={() => {
                  if (params.data) {
                    setStudentToEdit(params.data);
                    setEditStudentDialogOpen(true);
                  }
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center"
                onClick={() => params.data && generateMagicLink(params.data.id)}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Generate Access Link
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center text-red-600"
                onClick={() => {
                  if (params.data) {
                    setStudentToDelete(params.data.id);
                    setDeleteStudentDialogOpen(true);
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center' }
    }
  ];

  const publishMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const response = await fetch(`/api/exercises/${exerciseId}/publish`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to toggle publish status");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Successfully updated status!",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      queryClient.invalidateQueries({ queryKey: ["teacher-exercises"] });
    },
    onError: () => {
      toast({
        title: "Failed to update status",
        variant: "destructive"
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const response = await fetch(`/api/exercises/${exerciseId}/duplicate`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to duplicate exercise");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Exercise duplicated successfully!",
        description: "The target audience has been switched.",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      queryClient.invalidateQueries({ queryKey: ["teacher-exercises"] });
    },
    onError: () => {
      toast({
        title: "Failed to duplicate exercise",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete exercise");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Successfully deleted exercise!",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      setDeleteDialogOpen(false);
      setExerciseToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["teacher-exercises"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete exercise",
        description: error.message,
        variant: "destructive"
      });
      setDeleteDialogOpen(false);
      setExerciseToDelete(null);
    },
  });

  // Mutations para alunos
  const addStudentMutation = useMutation({
    mutationFn: async (studentData: StudentFormData) => {
      const response = await fetch("/api/teacher/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add student");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Student added successfully!",
        className: "bg-blue-50 border-blue-200 text-blue-800"
      });
      setAddStudentDialogOpen(false);
      setNewStudent({ fullName: "", email: "", level: "", isGeneral: true });
      queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error adding student", description: error.message, variant: "destructive" });
    },
  });

  const editStudentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StudentFormData>; }) => {
      const response = await fetch(`/api/teacher/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update student");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Student updated successfully!",
        className: "bg-blue-50 border-blue-200 text-blue-800"
      });
      setEditStudentDialogOpen(false);
      setStudentToEdit(null);
      queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating student", description: error.message, variant: "destructive" });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await fetch(`/api/teacher/students/${studentId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete student");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Student removed successfully!",
        className: "bg-orange-50 border-orange-200 text-orange-800"
      });
      setDeleteStudentDialogOpen(false);
      setStudentToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error removing student", description: error.message, variant: "destructive" });
    },
  });

  // Função para gerar link mágico
  const generateMagicLink = async (studentId: string) => {
    try {
      const response = await fetch("/api/teacher/students/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error generating link");
      }

      const { magicLink } = await response.json();

      await navigator.clipboard.writeText(magicLink);

      toast({
        title: "Link copied!",
        description: "The access link has been copied to clipboard.",
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate link";
      toast({
        title: "Error generating link",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted/30">
        <DashboardNav role="teacher" />
        <main className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                Teacher Dashboard {isAdmin && "(Admin View)"}
              </h1>
              <p className="text-muted-foreground">
                {isAdmin ? "Read-only mode - This is the view that teachers have." : "Manage your exercises and students"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{exercises?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published Exercises</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{publishedCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{submissionsCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="exercises" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="exercises" className='cursor-pointer'>Exercises</TabsTrigger>
              <TabsTrigger value="submissions" className='cursor-pointer'>Recent Submissions</TabsTrigger>
              <TabsTrigger value="students" className='cursor-pointer'>Students</TabsTrigger>
            </TabsList>

            {/* Exercises */}
            <TabsContent value="exercises" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground">
                  List of exercise books you have created.
                </p>
                {!isAdmin && (
                  <Button asChild className="gap-2">
                    <Link href="/dashboard/teacher/exercises/new" className="cursor-pointer">
                      <PlusCircle className="h-4 w-4" />
                      New Exercise Book
                    </Link>
                  </Button>
                )}
              </div>
              <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
                <AgGridReact
                  rowData={exercises}
                  columnDefs={exercisesColumnDefs}
                  defaultColDef={{
                    sortable: true,
                    filter: true,
                    resizable: true,
                  }}
                  pagination={true}
                  paginationPageSize={10}
                />
              </div>
            </TabsContent>

            {/* Recent Submissions */}
            <TabsContent value="submissions" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground">
                  View the most recent submissions from your students.
                </p>
              </div>
              <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
                <AgGridReact
                  rowData={recentSubmissions || []}
                  columnDefs={submissionsColumnDefs}
                  loading={loadingSubmissions}
                  defaultColDef={{
                    sortable: true,
                    filter: true,
                    resizable: true,
                  }}
                  pagination={true}
                  paginationPageSize={10}
                />
              </div>
            </TabsContent>

            {/* Students */}
            <TabsContent value="students" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground">
                  Manage your students and track their progress on exercises.
                </p>
                {!isAdmin && (
                  <Button
                    className="gap-2"
                    onClick={() => setAddStudentDialogOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Student
                  </Button>
                )}
              </div>

              <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
                <AgGridReact
                  rowData={students || []}
                  columnDefs={studentsColumnDefs}
                  loading={loadingStudents}
                  domLayout="autoHeight"
                  defaultColDef={{
                    sortable: true,
                    resizable: true,
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this exercise book? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => exerciseToDelete && deleteMutation.mutate(exerciseToDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Diálogo de Visualização de Submissão */}
        <SubmissionViewDialog
          open={submissionViewOpen}
          onOpenChange={setSubmissionViewOpen}
          submission={selectedSubmission}
        />

        {/* Diálogo Adicionar Aluno */}
        <Dialog open={addStudentDialogOpen} onOpenChange={setAddStudentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>Fill in the new student's information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  value={newStudent.level}
                  onChange={(e) => setNewStudent({ ...newStudent, level: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isGeneral">Target Audience</Label>
                <Select
                  value={newStudent.isGeneral ? "particular" : "bela-lira"}
                  onValueChange={(value) => setNewStudent({ ...newStudent, isGeneral: value === "particular" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bela-lira">Bela Lira</SelectItem>
                    <SelectItem value="particular">Particular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddStudentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => addStudentMutation.mutate(newStudent)}>
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo Editar Aluno */}
        <Dialog open={editStudentDialogOpen} onOpenChange={setEditStudentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>Update the student's information.</DialogDescription>
            </DialogHeader>
            {studentToEdit && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="editFullName">Full Name</Label>
                  <Input
                    id="editFullName"
                    value={studentToEdit.fullName}
                    onChange={(e) => setStudentToEdit({ ...studentToEdit, fullName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editLevel">Level</Label>
                  <Input
                    id="editLevel"
                    value={studentToEdit.level}
                    onChange={(e) => setStudentToEdit({ ...studentToEdit, level: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editIsGeneral">Target Audience</Label>
                  <Select
                    value={studentToEdit.isGeneral ? "particular" : "bela-lira"}
                    onValueChange={(value) => setStudentToEdit({ ...studentToEdit, isGeneral: value === "particular" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bela-lira">Bela Lira</SelectItem>
                      <SelectItem value="particular">Particular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditStudentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => studentToEdit && editStudentMutation.mutate({ id: studentToEdit.id, data: studentToEdit })}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo Confirmar Exclusão de Aluno */}
        <AlertDialog open={deleteStudentDialogOpen} onOpenChange={setDeleteStudentDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this student? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => studentToDelete && deleteStudentMutation.mutate(studentToDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

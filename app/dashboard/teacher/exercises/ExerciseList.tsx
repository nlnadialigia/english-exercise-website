"use client";

import '@/lib/ag-grid-config';

import { DashboardNav } from "@/components/dashboard-nav";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { BookCheck, Edit, Eye, MoreVertical, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export interface ExerciseListProps {
  teacherId: string;
}

export function ExerciseList({ teacherId }: ExerciseListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<any>(null);

  const { data: exercises, isLoading } = useQuery({
    queryKey: ["exercises-list", teacherId],
    queryFn: async () => {
      const response = await fetch(`/api/exercises/list-exercises?teacherId=${teacherId}`);
      if (!response.ok) throw new Error("Failed to fetch exercises");
      return response.json();
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const response = await fetch(`/api/exercises/${exerciseId}/publish`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to publish exercise");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Exercício publicado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["exercises-list", teacherId] });
    },
    onError: () => {
      toast({ title: "Erro ao publicar exercício", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete exercise");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Exercício excluído com sucesso!" });
      setDeleteDialogOpen(false);
      setExerciseToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["exercises-list", teacherId] });
    },
    onError: () => {
      toast({ title: "Erro ao excluir exercício", variant: "destructive" });
      setDeleteDialogOpen(false);
      setExerciseToDelete(null);
    },
  });

  const handleDeleteClick = (exercise: any) => {
    setExerciseToDelete(exercise);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (exerciseToDelete) {
      deleteMutation.mutate(exerciseToDelete.id);
    }
  };

  const ActionsCell = ({ data }: any) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/teacher/exercises/${data.id}/preview`} className="flex items-center gap-2 cursor-pointer">
            <Eye className="h-4 w-4" />
            Visualizar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/teacher/exercises/${data.id}`} className="flex items-center gap-2 cursor-pointer">
            <Edit className="h-4 w-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        {!data.isPublished && (
          <DropdownMenuItem onClick={() => publishMutation.mutate(data.id)} className="flex items-center gap-2 cursor-pointer">
            <BookCheck className="h-4 w-4" />
            Publicar
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => handleDeleteClick(data)}
          className="flex items-center gap-2 text-red-600 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const columnDefs: ColDef[] = [
    { field: "title", headerName: "Nome", flex: 1, filter: true },
    { field: "level", headerName: "Nível", flex: 1, filter: true },
    {
      field: "publicoAlvo",
      headerName: "Público Alvo",
      flex: 1,
      filter: true,
      valueGetter: (params: any) => params.data.isGeneral ? "Particular" : "Bela Lira"
    },
    {
      field: "difficulty",
      headerName: "Dificuldade",
      flex: 1,
      filter: true,
      valueFormatter: (params) => {
        switch (params.value) {
          case "easy": return "Fácil";
          case "medium": return "Médio";
          case "hard": return "Difícil";
          default: return params.value;
        }
      }
    },
    { field: "isPublished", headerName: "Publicado", flex: 1, filter: true, cellRenderer: (params: any) => params.value ? "Sim" : "Não" },
    {
      headerName: "Actions",
      width: 80,
      cellRenderer: ActionsCell,
      sortable: false,
      filter: false,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav role="teacher" />
      <main className="container mx-auto py-8 px-4 min-w-3xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lista de exercícios</h2>
            <Button asChild>
              <Link href="/dashboard/teacher/exercises/new" className="gap-2 cursor-pointer">
                <PlusCircle className="h-4 w-4" />
                Novo Exercício
              </Link>
            </Button>
          </div>
          <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
            <AgGridReact
              rowData={exercises || []}
              columnDefs={columnDefs}
              loading={isLoading}
              domLayout="autoHeight"
            />
          </div>
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir exercício</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o exercício "{exerciseToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  );
}

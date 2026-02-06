"use client";

import '@/lib/ag-grid-config';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Eye, Loader2, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FormSelect } from "../../../components/form-select";

type UserRole = "admin" | "teacher" | "student";
type UserType = "specific" | "general";


export function AdminUserManagement() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [level, setLevel] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [type, setType] = useState<UserType>("general");
  const [teacherId, setTeacherId] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const queryClient = useQueryClient();

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setLevel("");
    setTeacherId("");
    setType("general");
    setRole("student");
  };

  const handleCancel = () => {
    clearForm();
    setIsAdding(false);
  };

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const { data: teachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/teachers");
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      return data;
    },
  });

  const columnDefs: ColDef[] = [
    { field: "fullName", headerName: "Nome", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "role", headerName: "Função", flex: 1, valueFormatter: (params) => {
        switch (params.value) {
          case "admin": return "Administrador";
          case "teacher": return "Professor";
          case "student": return "Aluno";
          default: return params.value;
        }
      }
    },
    {
      field: "level",
      headerName: "Nível",
      flex: 1,
      valueFormatter: (params) => params.data.role === "student" && params.value ? params.value : "N/A"
    },
    {
      field: "isGeneral",
      headerName: "Tipo",
      flex: 1,
      cellRenderer: (params: any) => {
        if (params.data.role === "student") {
          return params.value ? "Particular" : "Bela Lira";
        }
        return "N/A";
      }
    },
    { field: "createdAt", headerName: "Criado em", flex: 1, valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
    {
      headerName: "Ações",
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          {params.data.role !== "admin" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`/dashboard/${params.data.role}`, '_blank')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUserToDelete(params.data);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
      width: 150,
      sortable: false,
      filter: false
    }
  ];

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Falha ao excluir usuário");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Usuário excluído com sucesso!");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir usuário");
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
          ...(role === "student" && {
            level,
            isGeneral: type === "general",
            teacherId: teacherId || null
          })
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Falha ao criar usuário");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      clearForm();
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Usuários Cadastrados</h2>
        <Button onClick={isAdding ? handleCancel : () => setIsAdding(true)}>
          {isAdding ? (
            "Cancelar"
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" /> Novo Usuário
            </>
          )}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="João Silva" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <div className="space-y-2">
                <FormSelect
                  label="Função"
                  value={role}
                  onChange={setRole}
                  options={[
                    { value: "admin", label: "Admin" },
                    { value: "teacher", label: "Professor" },
                    { value: "student", label: "Aluno" },
                  ]}
                />
              </div>

              {role === "student" && (
                <>
                  <div className="space-y-2">
                    <Label>Nível</Label>
                    <Input type="text" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="A1, A2, B1..." />
                  </div>

                  <div className="space-y-2">
                    <FormSelect
                      label="Tipo"
                      value={type}
                      onChange={setType}
                      options={[
                        { value: "specific", label: "Bela Lira" },
                        { value: "general", label: "Particular" },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormSelect
                      label="Professor"
                      value={teacherId}
                      onChange={setTeacherId}
                      placeholder={teachers?.length ? "Selecione um professor" : "Nenhum professor disponível"}
                      options={
                        (teachers || []).map((teacher: any) => ({
                          value: teacher.id,
                          label: teacher.fullName
                        }))
                      }
                    />
                    {(!teachers || teachers.length === 0) && (
                      <p className="text-sm text-muted-foreground">
                        Cadastre um professor primeiro para vincular ao aluno.
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => createUserMutation.mutate()}
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? <Loader2 className="animate-spin" /> : "Criar Usuário"}
                </Button>

                <Button
                  variant="outline"
                  onClick={clearForm}
                  disabled={createUserMutation.isPending}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
        <AgGridReact
          rowData={users || []}
          columnDefs={columnDefs}
          loading={isLoading}
          domLayout="autoHeight"
        />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.fullName}</strong>?
              {userToDelete?.role === "teacher" && (
                <span className="block mt-2 text-amber-600">
                  Atenção: Professores com exercícios ou alunos não podem ser excluídos.
                </span>
              )}
              {userToDelete?.role === "student" && (
                <span className="block mt-2 text-amber-600">
                  Atenção: Alunos com submissões não podem ser excluídos.
                </span>
              )}
              <span className="block mt-2 text-red-600">
                Esta ação não pode ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

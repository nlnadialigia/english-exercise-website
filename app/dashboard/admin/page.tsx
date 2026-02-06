export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/lib/actions/auth";
import { getSession } from "@/lib/actions/session";
import { UserService } from "@/lib/services/user-service";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { AdminUserManagement } from "./AdminUserManagement";

export default async function AdminDashboard() {
  const user = await getSession();

  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const allUsers = await UserService.getAllUsers();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex gap-8 justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie os professores e alunos da plataforma.</p>
        </div>
        <form action={logout}>
          <Button variant="outline" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Professores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.filter(u => u.role === 'teacher').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.filter(u => u.role === 'student').length}</div>
          </CardContent>
        </Card>
      </div>

      <AdminUserManagement />
    </div>
  );
}

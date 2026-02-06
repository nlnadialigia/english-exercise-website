"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function DashboardNav({ role }: { role: "teacher" | "student"; }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <nav className="flex items-center justify-between border-b px-6 py-4 bg-background">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-xl text-primary">
          English Exercises Hub
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={role === "teacher" ? "/dashboard/teacher" : "/dashboard/student"}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              pathname.includes("/dashboard") ? "text-primary" : "text-muted-foreground",
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </nav>
  );
}

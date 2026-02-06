export const dynamic = "force-dynamic";

import { getSession } from "@/lib/actions/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "admin") {
    redirect("/dashboard/admin");
  } else if (user.role === "teacher") {
    redirect("/dashboard/teacher");
  } else {
    redirect("/dashboard/student");
  }
}

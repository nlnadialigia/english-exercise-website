export const dynamic = "force-dynamic";

import { getSession } from "@/lib/actions/session";
import { redirect } from "next/navigation";
import ResultsClient from "./ResultsClient";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "student") {
    redirect("/dashboard");
  }

  return <ResultsClient submissionId={submissionId} />;
}

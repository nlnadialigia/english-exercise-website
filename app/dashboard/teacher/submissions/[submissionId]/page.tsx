export const dynamic = "force-dynamic";

import {getSession} from "@/lib/actions/session";
import {redirect} from "next/navigation";
import SubmissionReviewClient from "./SubmissionReviewClient";

export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{submissionId: string;}>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "teacher") {
    redirect("/dashboard");
  }

  const {submissionId} = await params;

  return <SubmissionReviewClient submissionId={submissionId} />;
}

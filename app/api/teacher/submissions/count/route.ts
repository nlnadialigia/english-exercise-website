import { getSession } from "@/lib/actions/session";
import { SubmissionService } from "@/lib/services/submission-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await SubmissionService.getTotalSubmissions(session.id);

    return NextResponse.json({ count });

  } catch (error) {
    console.error("Error fetching submissions count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

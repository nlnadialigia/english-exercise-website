import logger from "@/lib/logger";
import { UserService } from "@/lib/services/user-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const teachers = await UserService.getUsersByRole("teacher");

    return NextResponse.json(teachers);
  } catch (error) {
    logger.error("Error fetching teachers:", "DATABASE", error);
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}

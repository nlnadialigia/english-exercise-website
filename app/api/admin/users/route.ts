import logger from "@/lib/logger";
import { UserService } from "@/lib/services/user-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await UserService.getAllUsers();
    logger.database("Listando todos os usuários", { users });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

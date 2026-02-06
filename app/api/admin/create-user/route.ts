import { getSession } from "@/lib/actions/session";
import { IUser, UserService } from "@/lib/services/user-service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await getSession();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const newUser: IUser = await req.json();

    await UserService.createUser(newUser);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message?.includes("duplicate key")) {
      return NextResponse.json({ message: "Email já cadastrado" }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || "Erro ao criar usuário" }, { status: 400 });
  }
}

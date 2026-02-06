import { hashPassword } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import "dotenv/config";

async function seed() {
  console.log("🌱 Seeding database...");

  const adminHash = await hashPassword('admin');

  const data = [
    {
      fullName: "Admin",
      email: "admin@admin.com",
      passwordHash: adminHash,
      role: "admin" as UserRole,
      level: "",
      isGeneral: true,
      status: "active" as UserStatus
    }
  ];

  await prisma.user.createMany({
    data
  });

  console.log("✅ Seed finalizado");
  await prisma.$disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error("❌ Erro no seed:", err);
  await prisma.$disconnect();
  process.exit(1);
});

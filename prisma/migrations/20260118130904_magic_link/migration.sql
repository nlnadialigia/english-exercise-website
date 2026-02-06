-- CreateTable
CREATE TABLE "student_tokens" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_tokens_student_id_key" ON "student_tokens"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_tokens_token_key" ON "student_tokens"("token");

-- AddForeignKey
ALTER TABLE "student_tokens" ADD CONSTRAINT "student_tokens_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

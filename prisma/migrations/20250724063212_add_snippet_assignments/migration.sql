-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'ACTIVE', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssignmentAction" AS ENUM ('CREATED', 'UPDATED', 'SYNCED', 'SYNC_FAILED', 'ARCHIVED', 'RESTORED', 'DELETED');

-- CreateTable
CREATE TABLE "snippet_assignment" (
    "id" TEXT NOT NULL,
    "snippet_id" TEXT NOT NULL,
    "cat_type" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sync_metadata" JSONB,
    "last_sync_at" TIMESTAMP(3),

    CONSTRAINT "snippet_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_history" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "action" "AssignmentAction" NOT NULL,
    "user_id" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignment_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "snippet_assignment_snippet_id_idx" ON "snippet_assignment"("snippet_id");

-- CreateIndex
CREATE INDEX "snippet_assignment_cat_type_idx" ON "snippet_assignment"("cat_type");

-- CreateIndex
CREATE INDEX "snippet_assignment_status_idx" ON "snippet_assignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "snippet_assignment_snippet_id_cat_type_slug_key" ON "snippet_assignment"("snippet_id", "cat_type", "slug");

-- CreateIndex
CREATE INDEX "assignment_history_assignment_id_idx" ON "assignment_history"("assignment_id");

-- CreateIndex
CREATE INDEX "assignment_history_user_id_idx" ON "assignment_history"("user_id");

-- CreateIndex
CREATE INDEX "assignment_history_created_at_idx" ON "assignment_history"("created_at");

-- AddForeignKey
ALTER TABLE "snippet_assignment" ADD CONSTRAINT "snippet_assignment_snippet_id_fkey" FOREIGN KEY ("snippet_id") REFERENCES "snippet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snippet_assignment" ADD CONSTRAINT "snippet_assignment_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snippet_assignment" ADD CONSTRAINT "snippet_assignment_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "snippet_assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - The values [SUPER_ADMIN,TENANT_ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `email` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedBy` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `TenantPermission` table. All the data in the column will be lost.
  - You are about to drop the column `isFirstLogin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mustChangePassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordChangedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `admin_id` on the `admin_activity_log` table. All the data in the column will be lost.
  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[authId,module]` on the table `TenantPermission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authId` to the `TenantPermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `admin_activity_log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "TenantPermission" DROP CONSTRAINT "TenantPermission_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "admin_activity_log" DROP CONSTRAINT "admin_activity_log_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "block_allocation_audit" DROP CONSTRAINT "block_allocation_audit_created_by_fkey";

-- DropForeignKey
ALTER TABLE "card_allocation_audit" DROP CONSTRAINT "card_allocation_audit_allocated_by_fkey";

-- DropForeignKey
ALTER TABLE "contests" DROP CONSTRAINT "contests_created_by_fkey";

-- DropForeignKey
ALTER TABLE "draws" DROP CONSTRAINT "draws_executed_by_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sent_by_fkey";

-- DropForeignKey
ALTER TABLE "monthly_draw_history" DROP CONSTRAINT "monthly_draw_history_executed_by_fkey";

-- DropIndex
DROP INDEX "Tenant_email_idx";

-- DropIndex
DROP INDEX "Tenant_email_key";

-- DropIndex
DROP INDEX "TenantPermission_tenantId_idx";

-- DropIndex
DROP INDEX "TenantPermission_tenantId_module_key";

-- DropIndex
DROP INDEX "idx_card_allocation_position";

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "verifiedAt",
DROP COLUMN "verifiedBy",
ALTER COLUMN "brandColor" SET DEFAULT '#6366f1',
ALTER COLUMN "country" SET DEFAULT 'India',
ALTER COLUMN "drawFrequency" SET DEFAULT 'monthly',
ALTER COLUMN "timezone" SET DEFAULT 'Asia/Kolkata';

-- AlterTable
ALTER TABLE "TenantPermission" DROP COLUMN "tenantId",
ADD COLUMN     "authId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isFirstLogin",
DROP COLUMN "mustChangePassword",
DROP COLUMN "passwordChangedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "admin_activity_log" DROP COLUMN "admin_id",
ADD COLUMN     "tenant_id" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "block_allocation_audit" ALTER COLUMN "created_by" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "card_allocation_audit" ALTER COLUMN "allocated_by" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "contests" ADD COLUMN     "tenant_id" VARCHAR(100),
ALTER COLUMN "created_by" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "draws" ALTER COLUMN "executed_by" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "sent_by" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "monthly_draw_history" ALTER COLUMN "executed_by" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "tenant_id" VARCHAR(100);

-- DropTable
DROP TABLE "admins";

-- DropEnum
DROP TYPE "role_type";

-- CreateTable
CREATE TABLE "TenantAuth" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantAuth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantAuth_tenantId_key" ON "TenantAuth"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantAuth_email_key" ON "TenantAuth"("email");

-- CreateIndex
CREATE INDEX "TenantAuth_email_idx" ON "TenantAuth"("email");

-- CreateIndex
CREATE INDEX "TenantAuth_tenantId_idx" ON "TenantAuth"("tenantId");

-- CreateIndex
CREATE INDEX "ActivityLog_module_idx" ON "ActivityLog"("module");

-- CreateIndex
CREATE INDEX "EmailTemplate_templateType_idx" ON "EmailTemplate"("templateType");

-- CreateIndex
CREATE INDEX "EmailTemplate_isActive_idx" ON "EmailTemplate"("isActive");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "NotificationTemplate_name_idx" ON "NotificationTemplate"("name");

-- CreateIndex
CREATE INDEX "NotificationTemplate_isActive_idx" ON "NotificationTemplate"("isActive");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "SettingHistory_settingId_idx" ON "SettingHistory"("settingId");

-- CreateIndex
CREATE INDEX "SettingHistory_changedAt_idx" ON "SettingHistory"("changedAt");

-- CreateIndex
CREATE INDEX "SystemSetting_category_idx" ON "SystemSetting"("category");

-- CreateIndex
CREATE INDEX "TenantPermission_authId_idx" ON "TenantPermission"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantPermission_authId_module_key" ON "TenantPermission"("authId", "module");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "admin_activity_log_tenant_id_idx" ON "admin_activity_log"("tenant_id");

-- CreateIndex
CREATE INDEX "admin_activity_log_timestamp_idx" ON "admin_activity_log"("timestamp");

-- CreateIndex
CREATE INDEX "block_allocation_audit_created_by_idx" ON "block_allocation_audit"("created_by");

-- CreateIndex
CREATE INDEX "card_allocation_audit_allocated_by_idx" ON "card_allocation_audit"("allocated_by");

-- CreateIndex
CREATE INDEX "contests_tenant_id_idx" ON "contests"("tenant_id");

-- CreateIndex
CREATE INDEX "contests_created_by_idx" ON "contests"("created_by");

-- CreateIndex
CREATE INDEX "draws_executed_by_idx" ON "draws"("executed_by");

-- CreateIndex
CREATE INDEX "messages_sent_by_idx" ON "messages"("sent_by");

-- CreateIndex
CREATE INDEX "monthly_draw_history_executed_by_idx" ON "monthly_draw_history"("executed_by");

-- CreateIndex
CREATE INDEX "participants_tenant_id_idx" ON "participants"("tenant_id");

-- AddForeignKey
ALTER TABLE "TenantAuth" ADD CONSTRAINT "TenantAuth_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPermission" ADD CONSTRAINT "TenantPermission_authId_fkey" FOREIGN KEY ("authId") REFERENCES "TenantAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_activity_log" ADD CONSTRAINT "admin_activity_log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests" ADD CONSTRAINT "contests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draws" ADD CONSTRAINT "draws_executed_by_fkey" FOREIGN KEY ("executed_by") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_draw_history" ADD CONSTRAINT "monthly_draw_history_executed_by_fkey" FOREIGN KEY ("executed_by") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_allocation_audit" ADD CONSTRAINT "block_allocation_audit_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "card_allocation_audit" ADD CONSTRAINT "card_allocation_audit_allocated_by_fkey" FOREIGN KEY ("allocated_by") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
ALTER INDEX "idx_block_allocation_contest_block" RENAME TO "block_allocation_audit_contest_id_block_id_idx";

-- RenameIndex
ALTER INDEX "idx_block_allocation_status" RENAME TO "block_allocation_audit_block_status_idx";

-- RenameIndex
ALTER INDEX "idx_card_allocation_contest_block" RENAME TO "card_allocation_audit_contest_id_block_id_idx";

-- RenameIndex
ALTER INDEX "idx_card_allocation_participant" RENAME TO "card_allocation_audit_participation_id_idx";

-- RenameIndex
ALTER INDEX "idx_contests_block_allocation" RENAME TO "contests_block_allocation_enabled_idx";

-- RenameIndex
ALTER INDEX "idx_mega_draw_entries_trigger_word" RENAME TO "mega_draw_entries_trigger_word_used_idx";

-- RenameIndex
ALTER INDEX "idx_scratch_prizes_block_quantity" RENAME TO "scratch_card_prizes_quantity_per_block_idx";

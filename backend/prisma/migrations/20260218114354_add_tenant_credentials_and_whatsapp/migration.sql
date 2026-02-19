/*
  Warnings:

  - A unique constraint covering the columns `[tenantId]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/

-- Add columns with temporary defaults for existing rows
ALTER TABLE "Tenant" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "Tenant" ADD COLUMN "password" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "whatsappAccessToken" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "whatsappBusinessId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "whatsappPhoneNumberId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "whatsappVerifyToken" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "whatsappWebhookSecret" TEXT;

-- Update existing rows with default values
-- Password hash for "TempPassword@123"
UPDATE "Tenant" SET "password" = '$2a$10$YourHashedPasswordHere' WHERE "password" IS NULL;
UPDATE "Tenant" SET "tenantId" = 'TNT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12)) WHERE "tenantId" IS NULL;

-- Make columns required
ALTER TABLE "Tenant" ALTER COLUMN "password" SET NOT NULL;
ALTER TABLE "Tenant" ALTER COLUMN "tenantId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_tenantId_key" ON "Tenant"("tenantId");

-- CreateIndex
CREATE INDEX "Tenant_tenantId_idx" ON "Tenant"("tenantId");

-- CreateIndex
CREATE INDEX "Tenant_email_idx" ON "Tenant"("email");

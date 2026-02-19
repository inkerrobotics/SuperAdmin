-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "adminDesignation" TEXT,
ADD COLUMN     "adminFullName" TEXT,
ADD COLUMN     "adminMobileNumber" TEXT,
ADD COLUMN     "brandColor" TEXT,
ADD COLUMN     "businessCategory" TEXT,
ADD COLUMN     "businessVerificationStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "country" TEXT,
ADD COLUMN     "dataPrivacyAcknowledged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataUsageConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "drawFrequency" TEXT,
ADD COLUMN     "escalationContact" TEXT,
ADD COLUMN     "organizationLogo" TEXT,
ADD COLUMN     "primaryContactPerson" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "supportContactEmail" TEXT,
ADD COLUMN     "timezone" TEXT DEFAULT 'UTC',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT;

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateIndex
CREATE INDEX "Tenant_businessVerificationStatus_idx" ON "Tenant"("businessVerificationStatus");

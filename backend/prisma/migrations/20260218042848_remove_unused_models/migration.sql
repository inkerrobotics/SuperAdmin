/*
  Warnings:

  - You are about to drop the `Campaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Participant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TenantProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Winner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "TenantProfile" DROP CONSTRAINT "TenantProfile_approvedBy_fkey";

-- DropForeignKey
ALTER TABLE "TenantProfile" DROP CONSTRAINT "TenantProfile_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Winner" DROP CONSTRAINT "Winner_campaignId_fkey";

-- DropTable
DROP TABLE "Campaign";

-- DropTable
DROP TABLE "Participant";

-- DropTable
DROP TABLE "TenantProfile";

-- DropTable
DROP TABLE "Winner";

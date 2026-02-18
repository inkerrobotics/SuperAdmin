-- CreateTable
CREATE TABLE "TenantStatusHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "oldStatus" "TenantStatus" NOT NULL,
    "newStatus" "TenantStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenantStatusHistory_tenantId_idx" ON "TenantStatusHistory"("tenantId");

-- CreateIndex
CREATE INDEX "TenantStatusHistory_createdAt_idx" ON "TenantStatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "TenantStatusHistory" ADD CONSTRAINT "TenantStatusHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

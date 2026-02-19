-- CreateTable
CREATE TABLE "TenantPermission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canCreate" BOOLEAN NOT NULL DEFAULT true,
    "canEdit" BOOLEAN NOT NULL DEFAULT true,
    "canDelete" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenantPermission_tenantId_idx" ON "TenantPermission"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantPermission_tenantId_module_key" ON "TenantPermission"("tenantId", "module");

-- AddForeignKey
ALTER TABLE "TenantPermission" ADD CONSTRAINT "TenantPermission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

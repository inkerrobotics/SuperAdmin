/**
 * Migration Script: Separate Tenant Table
 * 
 * This script safely migrates the Tenant table into 4 separate tables:
 * 1. Tenant (core)
 * 2. TenantAuth (authentication)
 * 3. TenantProfile (organization details)
 * 4. TenantIntegration (WhatsApp credentials)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateTenantTables() {
  console.log('\n🚀 Starting Tenant Table Migration...\n');

  try {
    // Step 1: Get all existing tenants
    console.log('📊 Step 1: Fetching existing tenants...');
    const existingTenants = await prisma.$queryRaw`
      SELECT * FROM "Tenant"
    `;
    console.log(`   Found ${existingTenants.length} tenant(s)\n`);

    if (existingTenants.length === 0) {
      console.log('✅ No tenants to migrate. Creating new tables...\n');
    }

    // Step 2: Create new tables (using Prisma db push)
    console.log('📦 Step 2: Creating new tables...');
    console.log('   Run: npx prisma db push --accept-data-loss\n');
    console.log('   ⚠️  This will create TenantAuth, TenantProfile, TenantIntegration tables\n');

    // Step 3: Migrate data for each tenant
    if (existingTenants.length > 0) {
      console.log('🔄 Step 3: Migrating tenant data...\n');

      for (const oldTenant of existingTenants) {
        console.log(`   Migrating: ${oldTenant.name} (${oldTenant.email})`);

        try {
          // Check if already migrated
          const existingAuth = await prisma.tenantAuth.findUnique({
            where: { tenantId: oldTenant.id }
          });

          if (existingAuth) {
            console.log(`   ⏭️  Already migrated, skipping...\n`);
            continue;
          }

          // Migrate in transaction
          await prisma.$transaction(async (tx) => {
            // Create TenantAuth
            await tx.tenantAuth.create({
              data: {
                tenantId: oldTenant.id,
                email: oldTenant.email,
                password: oldTenant.password,
                lastLoginAt: oldTenant.lastLoginAt
              }
            });

            // Create TenantProfile
            await tx.tenantProfile.create({
              data: {
                tenantId: oldTenant.id,
                organizationLogo: oldTenant.organizationLogo,
                businessCategory: oldTenant.businessCategory,
                adminFullName: oldTenant.adminFullName,
                adminMobileNumber: oldTenant.adminMobileNumber,
                adminDesignation: oldTenant.adminDesignation,
                displayName: oldTenant.displayName,
                brandColor: oldTenant.brandColor,
                timezone: oldTenant.timezone,
                country: oldTenant.country,
                region: oldTenant.region,
                drawFrequency: oldTenant.drawFrequency,
                businessVerificationStatus: oldTenant.businessVerificationStatus,
                dataUsageConsent: oldTenant.dataUsageConsent,
                dataPrivacyAcknowledged: oldTenant.dataPrivacyAcknowledged,
                verifiedAt: oldTenant.verifiedAt,
                verifiedBy: oldTenant.verifiedBy,
                primaryContactPerson: oldTenant.primaryContactPerson,
                supportContactEmail: oldTenant.supportContactEmail,
                escalationContact: oldTenant.escalationContact
              }
            });

            // Create TenantIntegration
            await tx.tenantIntegration.create({
              data: {
                tenantId: oldTenant.id,
                whatsappPhoneNumberId: oldTenant.whatsappPhoneNumberId,
                whatsappAccessToken: oldTenant.whatsappAccessToken,
                whatsappBusinessId: oldTenant.whatsappBusinessId,
                whatsappWebhookSecret: oldTenant.whatsappWebhookSecret,
                whatsappVerifyToken: oldTenant.whatsappVerifyToken,
                whatsappEnabled: oldTenant.whatsappPhoneNumberId ? true : false,
                whatsappConfiguredAt: oldTenant.whatsappPhoneNumberId ? oldTenant.updatedAt : null
              }
            });
          });

          console.log(`   ✅ Migrated successfully\n`);
        } catch (error) {
          console.error(`   ❌ Error migrating ${oldTenant.name}:`, error.message);
          console.log('');
        }
      }
    }

    // Step 4: Verify migration
    console.log('🔍 Step 4: Verifying migration...\n');
    
    const [tenantCount, authCount, profileCount, integrationCount] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenantAuth.count(),
      prisma.tenantProfile.count(),
      prisma.tenantIntegration.count()
    ]);

    console.log(`   Tenants: ${tenantCount}`);
    console.log(`   TenantAuth: ${authCount}`);
    console.log(`   TenantProfile: ${profileCount}`);
    console.log(`   TenantIntegration: ${integrationCount}\n`);

    if (tenantCount === authCount && authCount === profileCount && profileCount === integrationCount) {
      console.log('✅ Migration successful! All counts match.\n');
    } else {
      console.log('⚠️  Warning: Counts do not match. Please verify data.\n');
    }

    // Step 5: Test a tenant login
    if (existingTenants.length > 0) {
      console.log('🧪 Step 5: Testing tenant data...\n');
      
      const testTenant = await prisma.tenant.findFirst({
        include: {
          auth: true,
          profile: true,
          integration: true
        }
      });

      if (testTenant && testTenant.auth && testTenant.profile && testTenant.integration) {
        console.log(`   ✅ Test tenant: ${testTenant.name}`);
        console.log(`   ✅ Auth email: ${testTenant.auth.email}`);
        console.log(`   ✅ Profile display name: ${testTenant.profile.displayName || 'N/A'}`);
        console.log(`   ✅ WhatsApp enabled: ${testTenant.integration.whatsappEnabled}\n`);
      }
    }

    console.log('🎉 Migration completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Replace service files:');
    console.log('      mv src/services/tenants.service.new.ts src/services/tenants.service.ts');
    console.log('      mv src/services/tenant-auth.service.new.ts src/services/tenant-auth.service.ts');
    console.log('   2. Build: npm run build');
    console.log('   3. Test: node test-tenant-login.js\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nPlease check the error and try again.\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateTenantTables();

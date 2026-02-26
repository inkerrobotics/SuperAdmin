import { PrismaClient, Role, TenantStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('Starting to seed sample data...');

    // Create sample tenants
    const tenants = [
      {
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        status: TenantStatus.ACTIVE,
        subscriptionPlan: 'Enterprise'
      },
      {
        name: 'TechStart Inc',
        email: 'info@techstart.com',
        status: TenantStatus.ACTIVE,
        subscriptionPlan: 'Professional'
      },
      {
        name: 'Global Solutions',
        email: 'hello@globalsolutions.com',
        status: TenantStatus.PENDING,
        subscriptionPlan: null
      },
      {
        name: 'Digital Ventures',
        email: 'contact@digitalventures.com',
        status: TenantStatus.INACTIVE,
        subscriptionPlan: 'Basic'
      }
    ];

    for (const tenantData of tenants) {
      const tenant = await prisma.tenant.create({
        data: tenantData
      });

      // Create admin user for each tenant
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          email: `admin@${tenantData.email.split('@')[1]}`,
          password: hashedPassword,
          role: Role.TENANT_ADMIN,
          tenantId: tenant.id
        }
      });

      // Create regular users for active tenants
      if (tenantData.status === TenantStatus.ACTIVE) {
        await prisma.user.create({
          data: {
            email: `user1@${tenantData.email.split('@')[1]}`,
            password: hashedPassword,
            role: Role.USER,
            tenantId: tenant.id
          }
        });
      }

      console.log(`Created tenant: ${tenantData.name}`);
    }

    console.log('Sample data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();

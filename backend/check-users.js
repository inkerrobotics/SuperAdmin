const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log(`\nTotal users: ${users.length}`);
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role})`);
    });
    
    const tenants = await prisma.tenant.findMany();
    console.log(`\nTotal tenants: ${tenants.length}`);
    tenants.forEach(t => {
      console.log(`- ${t.name} (${t.email}) - ${t.status}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();

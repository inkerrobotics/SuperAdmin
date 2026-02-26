import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const email = 'admin@example.com';
    const password = 'Admin@123';
    
    // Check if super admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Super Admin already exists with email:', email);
      return;
    }

    // Create super admin (plain text password - no hashing)
    const superAdmin = await prisma.user.create({
      data: {
        email,
        password: password,  // Plain text password
        role: Role.ADMIN,
        name: 'Super Admin'
      }
    });

    console.log('Super Admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', superAdmin.id);
  } catch (error) {
    console.error('Error creating Super Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();

import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  try {
    const AdminData = {
      email: 'admin@example.com',
      name: 'Admin',
      password: 'admin123',
    };

    const existingAdmin = await prisma.admin.findUnique({
      where: { email: AdminData.email },
    });

    if (existingAdmin) {
      console.log(`Admin with email ${AdminData.email} already exists.`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(AdminData.password, 10);

    // Create SuperAdmin
    const Admin = await prisma.admin.create({
      data: {
        email: AdminData.email,
        name: AdminData.name,
        password: hashedPassword,
      },
    });

    console.log(`Admin created successfully: ${Admin.email}`);
  } catch (error) {
    console.error('Error seeding Admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdmin();
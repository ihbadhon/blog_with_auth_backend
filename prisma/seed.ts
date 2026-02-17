import { PrismaClient, Role } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    where: { role: Role.ADMIN },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', existingAdmin.username);
    return;
  }

  const adminPassword = 'bolbo_na_pass'; // Change this to a secure password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      username: 'badhon.pimjo@gmail.com',
      email: 'badhon.pimjo@gmail.com',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  console.log('✅ Admin user created successfully!');
  //   console.log('   Email:', admin.email);
  //   console.log('   Password:', adminPassword);
  //   console.log('   ⚠️  Please change the default password after first login!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

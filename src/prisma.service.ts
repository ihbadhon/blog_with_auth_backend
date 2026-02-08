import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const adapter = new PrismaPg(pool);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma disconnected from database');
  }
}

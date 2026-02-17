import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, totalBlogs, totalComments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.blog.count(),
      this.prisma.comment.count(),
    ]);

    return {
      totalUsers,
      totalBlogs,
      totalComments,
    };
  }
}

import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LikeService {
  constructor(private prisma: PrismaService) {}

  async toggleLike(userId: number, blogId: number) {
    // Check if blog exists
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new HttpException('Blog not found', 404);
    }

    // Check if like already exists
    const existing = await this.prisma.like.findUnique({
      where: {
        userId_blogId: { userId, blogId },
      },
    });

    if (existing) {
      // Unlike: Remove the like
      await this.prisma.like.delete({
        where: {
          userId_blogId: { userId, blogId },
        },
      });

      const likeCount = await this.getLikeCount(blogId);

      return {
        action: 'unliked',
        liked: false,
        likeCount,
        message: 'Blog unliked successfully',
      };
    }

    // Like: Create a new like
    await this.prisma.like.create({
      data: { userId, blogId },
    });

    const likeCount = await this.getLikeCount(blogId);

    return {
      action: 'liked',
      liked: true,
      likeCount,
      message: 'Blog liked successfully',
    };
  }

  async getLikeCount(blogId: number): Promise<number> {
    return await this.prisma.like.count({
      where: { blogId },
    });
  }

  async getUsersWhoLiked(blogId: number) {
    const likes = await this.prisma.like.findMany({
      where: { blogId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return likes.map((like) => ({
      userId: like.user.id,
      username: like.user.username,
      email: like.user.email,
      likedAt: like.createdAt,
    }));
  }

  async hasUserLiked(userId: number, blogId: number): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_blogId: { userId, blogId },
      },
    });

    return !!like;
  }
}

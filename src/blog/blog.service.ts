import { HttpException, Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  // Public: Get all blogs
  async getAllBlogs() {
    const blogs = await this.prisma.blog.findMany({
      include: {
        author: {
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

    return blogs;
  }

  // Get single blog (can be public or private)
  async getBlogById(id: number) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!blog) {
      throw new HttpException('Blog not found', 404);
    }

    return blog;
  }

  // Protected: Create blog
  async createBlog(createBlogDto: CreateBlogDto, userId: number) {
    const newBlog = await this.prisma.blog.create({
      data: {
        title: createBlogDto.title,
        content: createBlogDto.content,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return newBlog;
  }

  // Protected: Update blog (only by author)
  async updateBlog(id: number, updateBlogDto: UpdateBlogDto, userId: number) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      throw new HttpException('Blog not found', 404);
    }

    // Check if user is the author
    if (blog.authorId !== userId) {
      throw new HttpException(
        'You are not authorized to update this blog',
        403,
      );
    }

    // Update blog
    const updatedBlog = await this.prisma.blog.update({
      where: { id },
      data: updateBlogDto,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return updatedBlog;
  }

  // Protected: Delete blog (only by author)
  async deleteBlog(id: number, userId: number) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      throw new HttpException('Blog not found', 404);
    }

    // Check if user is the author
    if (blog.authorId !== userId) {
      throw new HttpException(
        'You are not authorized to delete this blog',
        403,
      );
    }

    await this.prisma.blog.delete({
      where: { id },
    });

    return {
      message: 'Blog deleted successfully',
      deletedBlogId: id,
    };
  }

  // Get blogs by specific user
  async getBlogsByUser(userId: number) {
    const blogs = await this.prisma.blog.findMany({
      where: { authorId: userId },
      include: {
        author: {
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

    return blogs;
  }
}

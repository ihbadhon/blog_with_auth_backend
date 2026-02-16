import { HttpException, Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from '../prisma.service';
import { LikeService } from '../like/like.service';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class BlogService {
  constructor(
    private prisma: PrismaService,
    private likeService: LikeService,
  ) {}

  // // Public: Get all blogs
  // async getAllBlogs(userId?: number) {
  //   const blogs = await this.prisma.blog.findMany({
  //     include: {
  //       author: {
  //         select: {
  //           id: true,
  //           username: true,
  //           email: true,
  //         },
  //       },
  //       _count: {
  //         select: {
  //           likes: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       createdAt: 'desc',
  //     },
  //   });

  //   // Add like information to each blog
  //   const blogsWithLikes = await Promise.all(
  //     blogs.map(async (blog) => {
  //       const likedBy = await this.likeService.getUsersWhoLiked(blog.id);
  //       const isLikedByCurrentUser = userId
  //         ? await this.likeService.hasUserLiked(userId, blog.id)
  //         : false;

  //       return {
  //         ...blog,
  //         likeCount: blog._count.likes,
  //         likedBy,
  //         isLikedByCurrentUser,
  //       };
  //     }),
  //   );

  //   return blogsWithLikes;
  // }

  // Public: Get all blogs with pagination

  async getAllBlogs(paginationDto: PaginationDto, userId?: number) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },

          likes: {
            select: {
              userId: true,
            },
          },

          _count: {
            select: {
              likes: true,
            },
          },
        },
      }),
      this.prisma.blog.count(),
    ]);

    const blogsWithLikes = blogs.map((blog) => {
      const likedBy = blog.likes.map((like) => like.userId);

      const isLikedByCurrentUser = userId ? likedBy.includes(userId) : false;

      return {
        ...blog,
        likeCount: blog._count.likes,
        likedBy,
        isLikedByCurrentUser,
      };
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: blogsWithLikes,
    };
  }

  // Get single blog (can be public or private)
  async getBlogById(id: number, userId?: number) {
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
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!blog) {
      throw new HttpException('Blog not found', 404);
    }

    // Add like information
    const likedBy = await this.likeService.getUsersWhoLiked(blog.id);
    const isLikedByCurrentUser = userId
      ? await this.likeService.hasUserLiked(userId, blog.id)
      : false;

    return {
      ...blog,
      likeCount: blog._count.likes,
      likedBy,
      isLikedByCurrentUser,
    };
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
  async getBlogsByUser(userId: number, currentUserId?: number) {
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
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add like information to each blog
    const blogsWithLikes = await Promise.all(
      blogs.map(async (blog) => {
        const likedBy = await this.likeService.getUsersWhoLiked(blog.id);
        const isLikedByCurrentUser = currentUserId
          ? await this.likeService.hasUserLiked(currentUserId, blog.id)
          : false;

        return {
          ...blog,
          likeCount: blog._count.likes,
          likedBy,
          isLikedByCurrentUser,
        };
      }),
    );

    return blogsWithLikes;
  }
}

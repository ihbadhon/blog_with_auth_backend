import { HttpException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  // Get all comments for a specific blog (public)
  async getCommentsByBlog(blogId: number) {
    // First check if blog exists
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new HttpException('Blog not found', 404);
    }

    const comments = await this.prisma.comment.findMany({
      where: { blogId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments;
  }

  // Create a comment (authenticated)
  async createComment(createCommentDto: CreateCommentDto, userId: number) {
    // Check if blog exists
    const blog = await this.prisma.blog.findUnique({
      where: { id: createCommentDto.blogId },
    });

    if (!blog) {
      throw new HttpException('Blog not found', 404);
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        userId: userId,
        blogId: createCommentDto.blogId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        blog: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return comment;
  }

  // Update own comment (authenticated + owner check)
  async updateComment(
    commentId: number,
    updateCommentDto: UpdateCommentDto,
    userId: number,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new HttpException('Comment not found', 404);
    }

    // Check if user is the comment owner
    if (comment.userId !== userId) {
      throw new HttpException(
        'You are not authorized to update this comment',
        403,
      );
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        content: updateCommentDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return updatedComment;
  }

  // Delete own comment OR delete comment as blog owner
  async deleteComment(commentId: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        blog: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!comment) {
      throw new HttpException('Comment not found', 404);
    }

    // Check if user is the comment owner OR the blog owner
    const isCommentOwner = comment.userId === userId;
    const isBlogOwner = comment.blog.authorId === userId;

    if (!isCommentOwner && !isBlogOwner) {
      throw new HttpException(
        'You are not authorized to delete this comment',
        403,
      );
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return { message: 'Comment deleted successfully' };
  }
}

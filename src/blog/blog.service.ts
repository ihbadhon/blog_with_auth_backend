import { HttpException, Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

interface Blog {
    id: number;
    title: string;
    content: string;
    authorId: number;
    authorName: string;
    createdAt: Date;
    updatedAt: Date;
}

// In-memory blog storage
let blogs: Blog[] = [
    {
        id: 1,
        title: 'Getting Started with NestJS',
        content: 'NestJS is a progressive Node.js framework...',
        authorId: 1,
        authorName: 'john',
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-01-15')
    },
    {
        id: 2,
        title: 'Understanding JWT Authentication',
        content: 'JWT (JSON Web Tokens) are a secure way to authenticate...',
        authorId: 2,
        authorName: 'maria',
        createdAt: new Date('2026-01-20'),
        updatedAt: new Date('2026-01-20')
    }
];

let nextBlogId = 3;

@Injectable()
export class BlogService {
    
    // Public: Get all blogs
    getAllBlogs() {
        return blogs.map(blog => ({
            ...blog,
            createdAt: blog.createdAt.toISOString(),
            updatedAt: blog.updatedAt.toISOString()
        }));
    }

    // Get single blog (can be public or private)
    getBlogById(id: number) {
        const blog = blogs.find(b => b.id === id);
        
        if (!blog) {
            throw new HttpException('Blog not found', 404);
        }
        
        return {
            ...blog,
            createdAt: blog.createdAt.toISOString(),
            updatedAt: blog.updatedAt.toISOString()
        };
    }

    // Protected: Create blog
    createBlog(createBlogDto: CreateBlogDto, userId: number, username: string) {
        const newBlog: Blog = {
            id: nextBlogId++,
            title: createBlogDto.title,
            content: createBlogDto.content,
            authorId: userId,
            authorName: username,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        blogs.push(newBlog);
        
        return {
            ...newBlog,
            createdAt: newBlog.createdAt.toISOString(),
            updatedAt: newBlog.updatedAt.toISOString()
        };
    }

    // Protected: Update blog (only by author)
    updateBlog(id: number, updateBlogDto: UpdateBlogDto, userId: number) {
        const blog = blogs.find(b => b.id === id);
        
        if (!blog) {
            throw new HttpException('Blog not found', 404);
        }

        // Check if user is the author
        if (blog.authorId !== userId) {
            throw new HttpException('You are not authorized to update this blog', 403);
        }

        // Update fields
        if (updateBlogDto.title !== undefined) {
            blog.title = updateBlogDto.title;
        }
        if (updateBlogDto.content !== undefined) {
            blog.content = updateBlogDto.content;
        }
        blog.updatedAt = new Date();

        return {
            ...blog,
            createdAt: blog.createdAt.toISOString(),
            updatedAt: blog.updatedAt.toISOString()
        };
    }

    // Protected: Delete blog (only by author)
    deleteBlog(id: number, userId: number) {
        const blogIndex = blogs.findIndex(b => b.id === id);
        
        if (blogIndex === -1) {
            throw new HttpException('Blog not found', 404);
        }

        const blog = blogs[blogIndex];

        // Check if user is the author
        if (blog.authorId !== userId) {
            throw new HttpException('You are not authorized to delete this blog', 403);
        }

        blogs.splice(blogIndex, 1);

        return {
            message: 'Blog deleted successfully',
            deletedBlogId: id
        };
    }

    // Get blogs by specific user
    getBlogsByUser(userId: number) {
        return blogs
            .filter(b => b.authorId === userId)
            .map(blog => ({
                ...blog,
                createdAt: blog.createdAt.toISOString(),
                updatedAt: blog.updatedAt.toISOString()
            }));
    }
}

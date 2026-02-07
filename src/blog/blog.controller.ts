import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';

@Controller('blog')
export class BlogController {
    constructor(private blogService: BlogService) {}

    // Public endpoint - anyone can read all blogs
    @Get('public')
    getAllBlogs() {
        return this.blogService.getAllBlogs();
    }

    // Public endpoint - anyone can read a single blog
    @Get('public/:id')
    getBlogById(@Param('id', ParseIntPipe) id: number) {
        return this.blogService.getBlogById(id);
    }

    // Protected endpoints - require JWT authentication
    @Post()
    @UseGuards(JwtAuthGuard)
    createBlog(
        @Body() createBlogDto: CreateBlogDto,
        @Req() req: Request & { user: any }
    ) {
        return this.blogService.createBlog(
            createBlogDto,
            req.user.id,
            req.user.username
        );
    }

    @Get('my-blogs')
    @UseGuards(JwtAuthGuard)
    getMyBlogs(@Req() req: Request & { user: any }) {
        return this.blogService.getBlogsByUser(req.user.id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    updateBlog(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateBlogDto: UpdateBlogDto,
        @Req() req: Request & { user: any }
    ) {
        return this.blogService.updateBlog(id, updateBlogDto, req.user.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    deleteBlog(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request & { user: any }
    ) {
        return this.blogService.deleteBlog(id, req.user.id);
    }
}

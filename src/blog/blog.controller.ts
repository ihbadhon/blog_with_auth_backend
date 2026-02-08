import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RequestWithUser } from '../auth/interfaces/jwt-payload.interface';

@Controller('blogs')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get('public')
  getAllBlogs() {
    return this.blogService.getAllBlogs();
  }

  @Get('public/:id')
  getBlogById(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.getBlogById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @Req() req: RequestWithUser,
  ) {
    return this.blogService.createBlog(createBlogDto, req.user.id);
  }

  @Get('my-blogs')
  @UseGuards(JwtAuthGuard)
  getMyBlogs(@Req() req: RequestWithUser) {
    return this.blogService.getBlogsByUser(req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateBlog(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlogDto: UpdateBlogDto,
    @Req() req: RequestWithUser,
  ) {
    return this.blogService.updateBlog(id, updateBlogDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteBlog(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.blogService.deleteBlog(id, req.user.id);
  }
}

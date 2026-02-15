import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RequestWithUser } from '../auth/interfaces/jwt-payload.interface';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // Public: Get all comments for a specific blog
  @Get('blog/:blogId')
  getCommentsByBlog(@Param('blogId', ParseIntPipe) blogId: number) {
    return this.commentService.getCommentsByBlog(blogId);
  }

  // Protected: Create a comment (requires authentication)
  @Post()
  @UseGuards(JwtAuthGuard)
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.commentService.createComment(createCommentDto, req.user.id);
  }

  // Protected: Update own comment (requires authentication + ownership)
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.commentService.updateComment(id, updateCommentDto, req.user.id);
  }

  // Protected: Delete comment (requires authentication + ownership or blog ownership)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.commentService.deleteComment(id, req.user.id);
  }
}

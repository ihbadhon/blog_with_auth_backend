import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RequestWithUser } from '../auth/interfaces/jwt-payload.interface';

@Controller('likes')
export class LikeController {
  constructor(private likeService: LikeService) {}

  @Post(':blogId')
  @UseGuards(JwtAuthGuard)
  toggleLike(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.likeService.toggleLike(req.user.id, blogId);
  }
}

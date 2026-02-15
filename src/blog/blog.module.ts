import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { PrismaModule } from '../prisma.module';
import { LikeModule } from '../like/like.module';

@Module({
  imports: [PrismaModule, LikeModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}

import { Module } from '@nestjs/common';
;
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [AuthModule, UserModule, BlogModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

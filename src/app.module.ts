import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BlogModule } from './blog/blog.module';
import { PrismaModule } from './prisma.module';
import { CommentModule } from './comment/comment.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { LikeModule } from './like/like.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAILTRAP_HOST'),
          port: config.get('MAILTRAP_PORT'),
          auth: {
            user: config.get('MAILTRAP_USER'),
            pass: config.get('MAILTRAP_PASS'),
          },
        },
        defaults: {
          from: '"Blog Auth" <noreply@blog.com>',
        },
      }),
    }),
    AuthModule,
    UserModule,
    BlogModule,
    PrismaModule,
    CommentModule,
    LikeModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

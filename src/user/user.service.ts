import { HttpException, Injectable } from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return user;
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    // Note: In production, you should use bcrypt to hash and compare passwords
    if (user.password !== changePasswordDto.currentPassword) {
      throw new HttpException('Current password is incorrect', 401);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: changePasswordDto.newPassword,
      },
    });

    return {
      message: 'Password changed successfully',
    };
  }
}

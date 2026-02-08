import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestWithUser } from '../auth/interfaces/jwt-payload.interface';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  getProfile(@Req() req: RequestWithUser) {
    return this.userService.getUserProfile(req.user.id);
  }

  @Patch('change-password')
  changePassword(
    @Req() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(req.user.id, changePasswordDto);
  }
}

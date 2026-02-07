import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private userService: UserService) {}

    @Get('profile')
    getProfile(@Req() req: Request & { user: any }) {
        return this.userService.getUserProfile(req.user.id);
    }

    @Patch('change-password')
    changePassword(
        @Req() req: Request & { user: any },
        @Body() changePasswordDto: ChangePasswordDto
    ) {
        return this.userService.changePassword(req.user.id, changePasswordDto);
    }
}

import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AuthPayloadDto } from './dot/auth.dto';
import { AuthService } from './auth.service';
import { localGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RequestWithUser } from './interfaces/jwt-payload.interface';
import { ForgotPasswordDto } from 'src/user/dto/forgot-pass.dto';
import { ResetPasswordDto } from 'src/user/dto/reset-pass.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() authPayLoad: AuthPayloadDto) {
    return this.authService.register(authPayLoad);
  }

  @Get('verify/:email/:token')
  verifyEmail(@Param('email') email: string, @Param('token') token: string) {
    return this.authService.verifyEmail(email, token);
  }

  @Post('resend-otp')
  resendOtp(@Body() body: { email: string }) {
    return this.authService.resendOtp(body.email);
  }

  @Post('login')
  @UseGuards(localGuard)
  login(@Body() authPayLoad: AuthPayloadDto) {
    return this.authService.validateUser(authPayLoad);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: RequestWithUser) {
    console.log('insider auth controller get req');
    console.log(req.user);
    return req.user;
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password/:email/:token')
  resetPassword(
    @Param('email') email: string,
    @Param('token') token: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, email, dto.newPassword);
  }
}

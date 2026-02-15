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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() authPayLoad: AuthPayloadDto) {
    return this.authService.register(authPayLoad);
  }

  @Get('verify/:token')
  verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
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
}

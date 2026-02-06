import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthPayloadDto } from './dot/auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { localGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {};

    @Post('login') 
    @UseGuards(localGuard)
    login(@Body() authPayLoad: AuthPayloadDto) {
        return this.authService.validateUser(authPayLoad);
    }


    @Get('status')
    @UseGuards(JwtAuthGuard)
    status(@Req() req: Request & {user:any}) {
        console.log('insider auth controller get req');
        console.log(req.user);
        return req.user;
    }   
}

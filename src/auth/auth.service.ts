import {
  ConflictException,
  GoneException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthPayloadDto } from './dot/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp/otp.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailerService: MailerService,
    private configService: ConfigService,
    private otpService: OtpService,
  ) {}

  async register({ username, password }: AuthPayloadDto) {
    // Check if a user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new HttpException('User already exists', 400);
    }

    const hashedPass = await bcrypt.hash(password, 10);
    // const token = uuid();
    // Store in database
    const user = await this.prisma.user.create({
      data: {
        username: username,
        password: hashedPass,
        email: username, // Using username as email since it's validated as email
        // verifyToken: token,
      },
    });

    // store in redis

    const otp = await this.otpService.storeOtp(user.email);

    // Send verification email
    const appUrl = this.configService.get('APP_URL');
    const verificationUrl = `${appUrl}/auth/verify/${user.email}/${otp}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html: `
          <h1>Email Verification</h1>
          <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });

      return {
        message:
          'Registration successful! Please check your email to verify your account.',
        email: user.email,
      };
    } catch (error) {
      // Log the actual error for debugging
      console.error('Email sending failed:', error);

      // Rollback user creation if email fails
      await this.prisma.user.delete({ where: { id: user.id } });

      throw new InternalServerErrorException(
        `Failed to send verification email: ${error.message || 'Unknown error'}`,
      );
    }
  }
  async validateUser({ username, password }: AuthPayloadDto) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('user not found!');
    }

    if (!user.isVerified) {
      throw new HttpException(
        'Please verify your email before logging in',
        401,
      );
    }

    const isPassCorrect = await bcrypt.compare(password, user.password);

    if (isPassCorrect) {
      const { password, ...remainingData } = user;
      return this.jwtService.sign(remainingData);
    }

    throw new UnauthorizedException('invalid credentials!');
  }

  async verifyEmail(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new GoneException('Invalid or expired verification token');
    }

    if (user.isVerified) {
      throw new ConflictException('Email is already verified');
    }

    const isOtpValid = await this.otpService.verifyOtp(email, otp);

    if (!isOtpValid) {
      throw new GoneException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        // verifyToken: null,
      },
    });

    return {
      message: 'Email verified successfully! You can now log in.',
    };
  }

  async resendOtp(email: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (user.isVerified) {
      throw new HttpException('Email already verified', 400);
    }

    const otp = await this.otpService.storeOtp(email);

    // Send verification email
    const appUrl = this.configService.get('APP_URL');
    const verificationUrl = `${appUrl}/auth/verify/${email}/${otp}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <h1>Email Verification resend OTP</h1>
          <p>! Please verify your email address by clicking the link below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });

      return {
        message:
          'Verification email resent successfully! Please check your email.',
        email: email,
      };
    } catch (error) {
      // Log the actual error for debugging
      console.error('Email sending failed:', error);

      // Rollback user creation if email fails
      // await this.prisma.user.delete({ where: { id: user.id } });

      throw new HttpException(
        `Failed to send verification email: ${error.message || 'Unknown error'}`,
        500,
      );
    }
  }
}

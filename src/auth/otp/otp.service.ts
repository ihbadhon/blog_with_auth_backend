import { BadRequestException, Injectable } from '@nestjs/common';
import { redis } from 'src/common/redis.provider';
import { v4 as uuid } from 'uuid';

@Injectable()
export class OtpService {
  async storeOtp(email: string) {
    const key = `otp:${email}`;

    const otp = uuid().slice(0, 6).toUpperCase();

    await redis.set(key, otp, 'EX', 300);
    console.log('otp saved successfully!');

    return otp;
  }

  async verifyOtp(email: string, userOtp: string) {
    const key = `otp:${email}`;
    const storedOtp = await redis.get(key);

    if (!storedOtp) {
      throw new BadRequestException('OTP expired or not found');
    }

    if (storedOtp !== userOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    await redis.del(key);
    return true;
  }
}

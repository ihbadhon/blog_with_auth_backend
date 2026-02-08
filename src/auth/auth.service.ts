import { HttpException, Injectable } from '@nestjs/common';
import { AuthPayloadDto } from './dot/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  ///

  async register({username, password}:AuthPayloadDto) {
    //check if a user already exists
    const existingUser = await this.prisma.user.findUnique({
        where: {username},
    });

    if(existingUser) {
        throw new HttpException('User already exists', 400);
    }

    const hashedPass = await bcrypt.hash(password, 10);
    // sotre in database
    const user = await this.prisma.user.create({
        data: {
            username: username,
            password: hashedPass,
        },
    });

    const {password: _, ...remainingData} = user;
    return this.jwtService.sign(remainingData);
    
  }


////
  async validateUser({ username, password }: AuthPayloadDto) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new HttpException('invalid user', 401);
    }


    const isPassCorrect = await bcrypt.compare(password, user.password);

    if(isPassCorrect) {
      const {password, ...remainingData} = user;
        return this.jwtService.sign(remainingData);
    }

    throw new HttpException('Invalid credentials', 401);
  }
}

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class AuthPayloadDto {
  @IsEmail()
  // @ApiProperty({
  //   description: 'The email of the user',
  //   example: 'user@example.com',
  // })
  username: string;

  // @ApiProperty({
  //   description: 'The password of the user',
  //   example: 'password123',
  // })
  @IsString()
  @IsNotEmpty()
  password: string;
}

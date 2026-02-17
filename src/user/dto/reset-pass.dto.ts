import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @MinLength(4)
  newPassword: string;
}

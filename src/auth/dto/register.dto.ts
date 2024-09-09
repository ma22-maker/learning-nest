import {
  IsEmail,
  IsString,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must be at least 8 characters long, include at least one capital letter, and one special character',
  })
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

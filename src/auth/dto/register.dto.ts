import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;
}

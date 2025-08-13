import { IsBoolean, IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password!: string;

  @IsBoolean()
  stay_login!: boolean;
}



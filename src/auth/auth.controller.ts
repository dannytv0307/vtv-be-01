import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { Request } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body('active_token') activeToken: string) {
    return this.authService.verifyEmail(activeToken);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result: any = await this.authService.login(dto);
    // Set ONLY refresh token as HttpOnly cookie
    res.cookie('refresh_token', result._internal.refreshToken, {
      httpOnly: true,
      secure: false, // set true when HTTPS
      sameSite: 'lax',  
      maxAge: result.expiresIn.refreshToken * 1000,
    });
    // Return body without tokens
    return { message: result.message, expiresIn: result.expiresIn, stay_login: result.stay_login };
  }

  @Get('access-token')
  @HttpCode(HttpStatus.OK)
  async getAccessToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refresh = (req as any).cookies?.refresh_token;
    const result: any = await this.authService.issueAccessToken(refresh);
    // Set access token as HttpOnly cookie
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: false, // set true when HTTPS
      sameSite: 'lax',
      maxAge: result.expiresIn.accessToken * 1000,
    });
    // Set rotated refresh token as HttpOnly cookie
    if (result.refresh_token) {
      // prefer Redis TTL for short session if provided, otherwise uses refreshToken ttl
      const refreshTtlSec = result.expiresIn.refreshCacheRedis ?? result.expiresIn.refreshToken;
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: false, // set true when HTTPS
        sameSite: 'lax',
        maxAge: refreshTtlSec * 1000,
      });
    }
    // Return body including tokens as requested
    return { message: result.message, access_token: result.access_token, refresh_token: result.refresh_token, expiresIn: result.expiresIn };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Use refresh token from HttpOnly cookie
    const refresh = (req as any).cookies?.refresh_token;
    const result = await this.authService.logout({ refreshToken: refresh });
    // Clear cookies
    res.cookie('access_token', '', { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 0 });
    res.cookie('refresh_token', '', { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 0 });
    return { message: result.message };
  }
  
  }

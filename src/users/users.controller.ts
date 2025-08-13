import { Controller, Get, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  async me(@Req() req: Request) {
    const userId = (req as any).user?.id;
    if (!userId) return null;
    const user = await this.usersService.findByEmail((req as any).user?.email);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roleId: user.roleId,
      provider: user.provider,
    };
  }
}



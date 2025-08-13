import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // Read access token from HttpOnly cookie only
    const token: string | undefined = req?.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const payload: any = this.jwtService.verify(token);
      if (!payload || payload.type !== 'access' || !payload.sub) {
        throw new UnauthorizedException('Invalid access token');
      }
      req.user = { id: payload.sub, email: payload.email };
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}



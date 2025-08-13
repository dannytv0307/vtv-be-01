import { ConflictException, Injectable, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { RedisClientType } from 'redis';
import { DataSource } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { RefreshToken } from './entities/refresh-token.entity';
import { LOG_MESSAGES } from '../common/constants/log-messages';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  private getPositiveIntFromEnv(key: string, defaultValue: number): number {
    const raw = this.config.get<string>(key);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : defaultValue;
  }

  // Register with email uniqueness check and db-side hash (bcrypt cost 16 with PASSWORD_HASH_KEY)
  async register(dto: RegisterDto) {
    const existed = await this.usersService.findByEmail(dto.email);
    if (existed) {
      Logger.warn(
        `${LOG_MESSAGES.WARN.CREATE_USER_FAILED.code}: ${LOG_MESSAGES.WARN.CREATE_USER_FAILED.message}`,
        AuthService.name,
      );
      const err = ERROR_MESSAGES.AUTH.EMAIL_IN_USE;
      throw new ConflictException(`${err.code}: ${err.message}`);
    }

    // Generate active token for email verification
    const activeToken = this.jwtService.sign(
      { 
        email: dto.email,
        type: 'email_verification',
        timestamp: Date.now()
      }
    );
   
    // Send email verification BEFORE caching
    const sendResult = await this.mailService.sendVerificationEmail(
      dto.email,
      activeToken,
      dto.displayName,
    );

    if (!sendResult?.success) {
      Logger.warn(`Failed to send email verification to ${dto.email}`, AuthService.name);
      throw new ConflictException('Failed to send verification email');
    }

    // Store RegisterDto in Redis using email as key
    const ttl = Number(process.env.ACTIVE_TTL);
    await this.redis.set(`registration:${dto.email}`, JSON.stringify(dto), { EX: ttl });

    Logger.log(
      `Registration data stored in Redis with token: ${activeToken}`,
      AuthService.name,
    );

    return {
      message: 'Registration data stored successfully. Please check your email for verification.',
      email: dto.email,
      activeToken,
      emailSent: true,
    };
  }

  // Verify active token and complete registration
  async verifyEmail(token: string) {
    try {
      // Decode token to get email, then read Redis by email key
      const decoded: any = this.jwtService.decode(token);
      const email = decoded?.email;
      if (!email) {
        const err = ERROR_MESSAGES.AUTH.VERIFY_LINK_EXPIRED;
        throw new ConflictException(`${err.code}: ${err.message}`);
      }

      const registrationDataStr = await this.redis.get(`registration:${email}`);
      
      if (!registrationDataStr) {
        const err = ERROR_MESSAGES.AUTH.VERIFY_LINK_EXPIRED;
        throw new ConflictException(`${err.code}: ${err.message}`);
      }

      const registrationData = (typeof registrationDataStr === 'string'
        ? JSON.parse(registrationDataStr)
        : (registrationDataStr as any));

        
      // Create user in database
      const user = await this.usersService.create({
        email: registrationData.email,
        passwordHash: registrationData.password,
        displayName: registrationData.displayName,
        roleId: 2,
      });

      // Remove cached registration after successful creation
      await this.redis.del(`registration:${registrationData.email}`);

      return {
        message: 'Email verified successfully. Registration completed.',
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
      };
    } catch (error) {
      Logger.error(
        `Email verification failed: ${error.message}`,
        AuthService.name,
      );
      throw new Error('Invalid or expired verification token');
    }
  }

  // Login with access/refresh tokens storage
  async login(dto: LoginDto) {

    const user = await this.usersService.findByEmail(dto.email);

    // trả về message user không tồn tạitại
    if (!user) {
      const err = ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
      throw new ConflictException(`${err.code}: ${err.message}`);
    }


    // verify password
    const hashKey = this.config.get<string>('PASSWORD_HASH_KEY');
    if (!hashKey) throw new Error('PASSWORD_HASH_KEY is required');
    const h = crypto.createHmac('sha256', hashKey);
    h.update(dto.password);
    const passwordHash = h.digest('hex');

    // trả về message authentication failed
    if (user.passwordHash !== passwordHash) {
      const err = ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
      throw new ConflictException(`${err.code}: ${err.message}`);
    }

    // TTLs from env (seconds) with safe defaults
    const refreshShortTtlSec = this.getPositiveIntFromEnv('REFRESH_TTL_SHORT', 3600);
    const reportedTtlSec = dto.stay_login ? 30 * 24 * 60 * 60 : refreshShortTtlSec;

    // Generate ONLY refresh token
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'refresh',
        stay_login: !!dto.stay_login,
        tier: dto.stay_login ? 'long' : 'short',
      },
      { expiresIn: `${reportedTtlSec}s` }
    );

    // Persist refresh token in DB ONLY when stay_login = true
    if (dto.stay_login) {
      const rtRepo = this.dataSource.getRepository(RefreshToken);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const existing = await rtRepo.findOne({ where: { userId: user.id } });
      if (existing) {
        existing.token = refreshToken;
        existing.expiresAt = expiresAt;
        existing.isRevoked = false;
        await rtRepo.save(existing);
      } else {
        const row = rtRepo.create({ userId: user.id, token: refreshToken, expiresAt, isRevoked: false });
        await rtRepo.save(row);
      }
    }

    // Cache refresh token in Redis
    const refreshCacheTtl = this.getPositiveIntFromEnv('REFRESH_CACHE', 3600);
    await this.redis.set(`refresh:${user.id}`, refreshToken, { EX: refreshCacheTtl });

    // Return minimal info; controller will set HttpOnly cookie and not expose token
    return {
      message: 'Login success',
      expiresIn: {
        refreshToken: reportedTtlSec,
      },
      stay_login: dto.stay_login,
      _internal: { refreshToken },
    } as any;
  }

  // generate access_token expires in 15m and renew refresh_token
  // generate access_token expires in 15m
  async issueAccessToken(refreshToken: string) {
    if (!refreshToken || typeof refreshToken !== 'string') {
      const err = ERROR_MESSAGES.AUTH.INVALID_TOKEN;
      throw new ConflictException(`${err.code}: ${err.message}`);
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        const err = ERROR_MESSAGES.AUTH.TOKEN_EXPIRED;
        throw new ConflictException(`${err.code}: ${err.message}`);
      }
      const err = ERROR_MESSAGES.AUTH.INVALID_TOKEN;
      throw new ConflictException(`${err.code}: ${err.message}`);
    }

    if (!payload || payload.type !== 'refresh' || !payload.email || !payload.sub) {
      const err = ERROR_MESSAGES.AUTH.INVALID_TOKEN;
      throw new ConflictException(`${err.code}: ${err.message}`);
    }

    const user = await this.usersService.findByEmail(payload.email); 
    if (!user || user.id !== payload.sub) {
      const err = ERROR_MESSAGES.AUTH.INVALID_TOKEN;
      throw new ConflictException(`${err.code}: ${err.message}`);
    }

    // Validate and rotate by stay_login flag
    const accessTtlSec = this.getPositiveIntFromEnv('ACCESS_TTL', 15 * 60);
    const refreshShortTtlSec = this.getPositiveIntFromEnv('REFRESH_TTL_SHORT', 3600);

    const cached = await this.redis.get(`refresh:${user.id}`);

    if (!payload.stay_login) {
      // Case 2.1: stay_login = false (short session in Redis only)
      if (!cached || cached !== refreshToken) {
        const err = ERROR_MESSAGES.AUTH.INVALID_TOKEN;
        throw new ConflictException(`${err.code}: ${err.message}`);
      }

      // Rotate refresh token (short tier)
      const newRefreshToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          type: 'refresh',
          stay_login: false,
          tier: 'short',
        },
        { expiresIn: `${refreshShortTtlSec}s` },
      );

      // Update Redis with new token and expiration
      await this.redis.set(`refresh:${user.id}`, newRefreshToken, { EX: refreshShortTtlSec });

      // Issue new access token
      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, type: 'access' },
        { expiresIn: `${accessTtlSec}s` },
      );

      return {
        message: 'Access token issued',
        access_token: accessToken,
        refresh_token: newRefreshToken,
        expiresIn: {
          accessToken: accessTtlSec,
          refreshToken: refreshShortTtlSec,
        },
      };
    }

    // Case 2.2: stay_login = true (long session; Redis fallback to DB)
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const oneHourSec = 60 * 60;

    if (cached && cached !== refreshToken) {
      const err = ERROR_MESSAGES.AUTH.INVALID_TOKEN;
      throw new ConflictException(`${err.code}: ${err.message}`);
    }

    if (!cached) {
      const rtRepo = this.dataSource.getRepository(RefreshToken);
      const record = await rtRepo.findOne({ where: { userId: user.id } });
      const now = Date.now();
      const validInDb =
        !!record &&
        record.isRevoked === false &&
        record.token === refreshToken &&
        record.expiresAt && new Date(record.expiresAt).getTime() > now;
      if (!validInDb) {
        const err = ERROR_MESSAGES.AUTH.INVALID_TOKEN;
        throw new ConflictException(`${err.code}: ${err.message}`);
      }
    }

    // Rotate refresh token (long tier)
    const newRefreshToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'refresh',
        stay_login: true,
        tier: 'long',
      },
      { expiresIn: `${Math.floor(thirtyDaysMs / 1000)}s` },
    );

    // Update Redis (1 hour)
    await this.redis.set(`refresh:${user.id}`, newRefreshToken, { EX: oneHourSec });

    // Update DB (30 days)
    const rtRepo = this.dataSource.getRepository(RefreshToken);
    const existing = await rtRepo.findOne({ where: { userId: user.id } });
    const newExpiresAt = new Date(Date.now() + thirtyDaysMs);
    if (existing) {
      existing.token = newRefreshToken;
      existing.expiresAt = newExpiresAt;
      existing.isRevoked = false;
      await rtRepo.save(existing);
    } else {
      const row = rtRepo.create({ userId: user.id, token: newRefreshToken, expiresAt: newExpiresAt, isRevoked: false });
      await rtRepo.save(row);
    }

    // Issue new access token
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'access' },
      { expiresIn: `${accessTtlSec}s` },
    );

    return {
      message: 'Access token issued',
      access_token: accessToken,
      refresh_token: newRefreshToken,
      expiresIn: {
        accessToken: accessTtlSec,
        refreshToken: Math.floor(thirtyDaysMs / 1000),
        refreshCacheRedis: oneHourSec,
      },
    };
  }

  async logout(options: { refreshToken?: string | null }) {
    const refreshToken = options?.refreshToken ?? undefined;

    if (!refreshToken || typeof refreshToken !== 'string') {
      return { message: 'Logout success' };
    }

    let userId: number | null = null;
    let stayLogin: boolean | null = null;
    try {
      const p: any = this.jwtService.verify(refreshToken);
      if (p?.sub) userId = p.sub;
      if (typeof p?.stay_login === 'boolean') stayLogin = p.stay_login;
    } catch {
      // ignore invalid refresh token; still proceed to clear cookies on controller
    }

    if (userId != null) {
      // Remove refresh token in Redis
      try {
        await this.redis.del(`refresh:${userId}`);
      } catch {}

      // Revoke DB refresh token if exists (stay_login sessions)
      if (stayLogin === true) {
        const rtRepo = this.dataSource.getRepository(RefreshToken);
        const record = await rtRepo.findOne({ where: { userId } });
        if (record) {
          record.isRevoked = true;
          record.expiresAt = new Date();
          await rtRepo.save(record);
        }
      }
    }

    return { message: 'Đăng xuất thành công' };
  }
}

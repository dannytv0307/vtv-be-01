import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  displayName?: string | null;
  roleId?: number | null;
}


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    // Hash password with bcrypt-like approach using crypto
    const passwordHash = this.hashPassword(createUserInput.passwordHash);
    
    const user = this.userRepo.create({
      email: createUserInput.email,
      passwordHash: passwordHash,
      displayName: createUserInput.displayName,
      provider: 'local' as any,
      roleId: createUserInput.roleId ?? 2,
    });

    return this.userRepo.save(user);
  }

  private hashPassword(password: string): string {
    const hashKey = this.configService.get<string>('PASSWORD_HASH_KEY');
    if (!hashKey) {
      throw new Error('PASSWORD_HASH_KEY is required');
    }
    
    // Create hash using crypto
    const hash = crypto.createHmac('sha256', hashKey);
    hash.update(password);
    return hash.digest('hex');
  }
}

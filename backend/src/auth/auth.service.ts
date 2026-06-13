import { createHash } from 'crypto';
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import type { JwtPayload } from './auth.types';
import type { LoginDto } from './dto/login.dto';
import type { LoginResponseDto } from './dto/login-response.dto';

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const sql = this.db.getSql();

    const [user] = await sql<
      {
        id: string;
        account_id: string;
        email: string;
        name: string;
        role: 'owner' | 'admin' | 'operator';
        password_hash: string;
        is_active: boolean;
      }[]
    >`SELECT id, account_id, email, name, role, password_hash, is_active
      FROM app_user WHERE email = ${dto.email} LIMIT 1`;

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const allowedRestaurantIds = await this.resolveAllowedRestaurants(
      sql,
      user.id,
      user.account_id,
      user.role,
    );

    const payload: JwtPayload = {
      sub: user.id,
      accountId: user.account_id,
      role: user.role,
      allowedRestaurantIds,
    };

    const { accessToken, refreshToken } = await this.issueTokens(
      user.id,
      payload,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        allowedRestaurantIds,
      },
    };
  }

  async refresh(refreshToken: string): Promise<LoginResponseDto> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret')!,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const stored = await this.redis
      .getClient()
      .get(`refresh:${payload.sub}`);
    const incoming = this.hashToken(refreshToken);

    if (!stored || stored !== incoming) {
      throw new UnauthorizedException('Refresh token revogado');
    }

    const { accessToken, refreshToken: newRefresh } = await this.issueTokens(
      payload.sub,
      payload,
    );

    return {
      accessToken,
      refreshToken: newRefresh,
      user: {
        id: payload.sub,
        name: '',
        email: '',
        role: payload.role,
        allowedRestaurantIds: payload.allowedRestaurantIds,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    await this.redis.getClient().del(`refresh:${userId}`);
  }

  async me(userId: string) {
    const sql = this.db.getSql();
    const [user] = await sql<
      { id: string; name: string; email: string; role: string; account_id: string }[]
    >`SELECT id, name, email, role, account_id FROM app_user WHERE id = ${userId}`;

    if (!user) throw new UnauthorizedException();

    const restaurants = await sql<{ id: string; name: string; slug: string }[]>`
      SELECT id, name, slug FROM restaurants
      WHERE account_id = ${user.account_id} AND status = 'active'
    `;

    return { ...user, restaurants };
  }

  private async issueTokens(userId: string, payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_EXPIRY,
    });
    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('jwt.refreshSecret')!,
        expiresIn: REFRESH_EXPIRY,
      },
    );

    await this.redis
      .getClient()
      .set(
        `refresh:${userId}`,
        this.hashToken(refreshToken),
        'EX',
        REFRESH_TTL_SECONDS,
      );

    return { accessToken, refreshToken };
  }

  private async resolveAllowedRestaurants(
    sql: ReturnType<DatabaseService['getSql']>,
    userId: string,
    accountId: string,
    role: string,
  ): Promise<string[]> {
    if (role === 'owner' || role === 'admin') {
      const rows = await sql<{ id: string }[]>`
        SELECT id FROM restaurants WHERE account_id = ${accountId} AND status = 'active'
      `;
      return rows.map((r) => r.id);
    }

    const rows = await sql<{ restaurant_id: string }[]>`
      SELECT restaurant_id FROM user_restaurant_access WHERE user_id = ${userId}
    `;
    return rows.map((r) => r.restaurant_id);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

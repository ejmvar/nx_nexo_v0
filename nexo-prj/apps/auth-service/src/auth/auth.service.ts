import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service.js';
import { RedisService } from '../redis/redis.service.js';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import type { RegisterDto, LoginDto, UserProfile, AuthResponse } from './dto/auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private database: DatabaseService,
    private redis: RedisService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, username, full_name, role = 'employee', account_id } = registerDto;

    // If no account_id provided, create a new account for this user
    let accountId = account_id;
    if (!accountId) {
      const accountResult = await this.database.query(
        `INSERT INTO accounts (name, slug, active)
         VALUES ($1, $2, true)
         RETURNING id`,
        [full_name || username, username.toLowerCase()]
      );
      accountId = accountResult.rows[0].id;
    }

    // Check if user already exists
    const existingUser = await this.database.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with account_id
    const result = await this.database.query(
      `INSERT INTO users (account_id, email, password_hash, username, first_name, last_name, active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, account_id, email, username, first_name, last_name, active, created_at`,
      [accountId, email, passwordHash, username, full_name?.split(' ')[0] || username, full_name?.split(' ').slice(1).join(' ') || '', ]
    );

    const user = result.rows[0];
    return this.generateAuthResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Get user from database with account_id
    const result = await this.database.query(
      `SELECT id, account_id, email, username, first_name, last_name, active, password_hash, created_at, last_login_at
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.active) {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.database.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    delete user.password_hash;
    return this.generateAuthResponse(user);
  }

  async validateUser(userId: string): Promise<UserProfile | null> {
    // Try to get from cache first
    const cached = await this.redis.getJson<UserProfile>(`user:${userId}`);
    if (cached) {
      return cached;
    }

    // Get from database with account_id
    const result = await this.database.query(
      `SELECT id, account_id, email, username, first_name, last_name, active, created_at, last_login_at
       FROM users WHERE id = $1 AND active = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    // Cache for 5 minutes
    await this.redis.setJson(`user:${userId}`, user, 300);

    return user;
  }

  async logout(userId: string, token: string): Promise<void> {
    // Blacklist the token
    const decoded = this.jwtService.decode(token) as any;
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    
    if (expiresIn > 0) {
      await this.redis.set(`blacklist:${token}`, '1', expiresIn);
    }

    // Clear user cache
    await this.redis.del(`user:${userId}`);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.redis.exists(`blacklist:${token}`);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = this.jwtService.verify(refreshToken) as any;
      
      // Validate user still exists and is active
      const user = await this.validateUser(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    // Get current password hash
    const result = await this.database.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const user = result.rows[0];

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.database.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Clear user cache
    await this.redis.del(`user:${userId}`);
  }

  private async generateAuthResponse(user: UserProfile): Promise<AuthResponse> {
    const payload = { 
      sub: user.id,
      account_id: user.account_id,
      email: user.email,
      username: user.username
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        account_id: user.account_id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        active: user.active,
        created_at: user.created_at,
        last_login_at: user.last_login_at,
      },
    };
  }
}
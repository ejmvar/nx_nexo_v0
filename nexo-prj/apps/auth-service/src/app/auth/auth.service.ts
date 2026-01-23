import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto.js';
import type { AuthResponse, JwtPayload } from './interfaces/auth.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Register a new user and create their account
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, firstName, lastName, username, accountName, accountSlug } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if account slug already exists
    const existingAccount = await this.prisma.account.findUnique({
      where: { slug: accountSlug },
    });

    if (existingAccount) {
      throw new ConflictException('Account slug already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create account, user, and admin role in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create account
      const account = await tx.account.create({
        data: {
          name: accountName,
          slug: accountSlug,
          active: true,
        },
      });

      // Create admin role for this account
      const adminRole = await tx.role.create({
        data: {
          accountId: account.id,
          name: 'Admin',
          permissions: ['*'], // Admin has all permissions
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          accountId: account.id,
          email,
          username,
          firstName,
          lastName,
          passwordHash: hashedPassword,
          active: true,
        },
      });

      // Assign admin role to user
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
        },
      });

      return { user, account, adminRole };
    });

    // Generate tokens
    return this.generateAuthResponse(
      result.user.id,
      result.user.email,
      result.account.id,
      [result.adminRole.id]
    );
  }

  /**
   * Login user with email and password
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user with roles
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Extract role IDs
    const roleIds = user.roles.map((ur) => ur.roleId);

    // Generate tokens
    return this.generateAuthResponse(user.id, user.email, user.accountId, roleIds);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });

      // Find user to ensure they still exist and are active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || !user.active) {
        throw new UnauthorizedException('User no longer exists or is inactive');
      }

      const roleIds = user.roles.map((ur) => ur.roleId);

      // Generate new tokens
      return this.generateAuthResponse(user.id, user.email, user.accountId, roleIds);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validate user from JWT payload (used by Passport JWT Strategy)
   */
  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        account: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  /**
   * Generate auth response with access and refresh tokens
   */
  private async generateAuthResponse(
    userId: string,
    email: string,
    accountId: string,
    roleIds: string[]
  ): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      accountId, // Critical for RLS enforcement in downstream services
      roleIds,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });

    // Fetch user with relations for response
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        account: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        account: user.account,
        roles: user.roles.map((ur) => ur.role),
      },
    };
  }
}

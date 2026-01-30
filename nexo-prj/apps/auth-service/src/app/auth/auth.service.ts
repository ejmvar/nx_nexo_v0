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

    // For registration, we need to use a superuser connection to bypass RLS
    // Create a temporary Prisma client with superuser credentials
    const { PrismaClient } = await import('@prisma/client');
    const { PrismaPg } = await import('@prisma/adapter-pg');
    const pg = await import('pg');
    
    const superPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL_SUPERUSER,
    });
    const superAdapter = new PrismaPg(superPool);
    const superPrisma = new PrismaClient({ adapter: superAdapter });

    try {
      // Create account, user, and admin role in a transaction using superuser connection
      const result = await superPrisma.$transaction(async (tx: any) => {
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

        // Link ALL permissions to the Admin role via role_permissions table
        // This is required for the RBAC permissions guard to work
        await tx.$executeRawUnsafe(`
          INSERT INTO role_permissions (role_id, permission_id)
          SELECT '${adminRole.id}'::uuid, p.id
          FROM permissions p
          ON CONFLICT DO NOTHING
        `);

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
      const authResponse = await this.generateAuthTokens(
        result.user.id,
        result.user.email,
        result.account.id,
        [result.adminRole.id],
        result.user,
        result.account
      );
      
      return authResponse;
    } finally {
      // Clean up superuser connection
      await superPrisma.$disconnect();
      await superPool.end();
    }
  }

  /**
   * Login user with email and password
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Use superuser connection for login lookup (before we know the account context)
    const { PrismaClient } = await import('@prisma/client');
    const { PrismaPg } = await import('@prisma/adapter-pg');
    const pg = await import('pg');
    
    const superPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL_SUPERUSER,
    });
    const superAdapter = new PrismaPg(superPool);
    const superPrisma = new PrismaClient({ adapter: superAdapter });

    try {
      // Find user with roles and account using superuser connection
      const user = await superPrisma.user.findUnique({
        where: { email },
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
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Extract role IDs
      const roleIds = user.roles.map((ur) => ur.roleId);

      // Update last login using superuser connection
      await superPrisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      return this.generateAuthTokens(
        user.id,
        user.email,
        user.accountId,
        roleIds,
        user,
        user.account
      );
    } finally {
      await superPrisma.$disconnect();
      await superPool.end();
    }
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

      // Use superuser connection to verify user still exists
      const { PrismaClient } = await import('@prisma/client');
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const pg = await import('pg');
      
      const superPool = new pg.Pool({
        connectionString: process.env.DATABASE_URL_SUPERUSER,
      });
      const superAdapter = new PrismaPg(superPool);
      const superPrisma = new PrismaClient({ adapter: superAdapter });

      try {
        // Find user to ensure they still exist and are active
        const user = await superPrisma.user.findUnique({
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
          throw new UnauthorizedException('User no longer exists or is inactive');
        }

        const roleIds = user.roles.map((ur) => ur.roleId);

        // Generate new tokens
        return this.generateAuthTokens(
          user.id,
          user.email,
          user.accountId,
          roleIds,
          user,
          user.account
        );
      } finally {
        await superPrisma.$disconnect();
        await superPool.end();
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validate user from JWT payload (used by Passport JWT Strategy)
   */
  async validateUser(payload: JwtPayload) {
    // Use superuser connection for validation lookup
    const { PrismaClient } = await import('@prisma/client');
    const { PrismaPg } = await import('@prisma/adapter-pg');
    const pg = await import('pg');
    
    const superPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL_SUPERUSER,
    });
    const superAdapter = new PrismaPg(superPool);
    const superPrisma = new PrismaClient({ adapter: superAdapter });

    try {
      const user = await superPrisma.user.findUnique({
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
    } finally {
      await superPrisma.$disconnect();
      await superPool.end();
    }
  }

  /**
   * Generate tokens without database queries (for registration/login)
   */
  private async generateAuthTokens(
    userId: string,
    email: string,
    accountId: string,
    roleIds: string[],
    user: any,
    account: any
  ): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      accountId,
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

    // Build roles array from user data if available
    const roles = user.roles ? user.roles.map((ur: any) => ur.role) : [{
      id: roleIds[0],
      name: 'Admin',
      permissions: ['*'],
    }];

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        account: {
          id: account.id,
          name: account.name,
          slug: account.slug,
        },
        roles,
      },
    };
  }
}

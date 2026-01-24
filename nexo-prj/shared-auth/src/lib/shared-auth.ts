import type { NextAuthOptions } from 'next-auth';

// User types for NEXO platform
export type UserType = 'employee' | 'client' | 'supplier' | 'professional';

export interface NexoUser {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  role?: string;
  permissions?: string[];
}

// NextAuth configuration - simplified for now
export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'credentials',
      name: 'credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        // Mock authentication for development
        if (credentials?.email === 'test@nexo.com' && credentials?.password === 'password') {
          return {
            id: '1',
            email: 'test@nexo.com',
            name: 'Test User',
            userType: 'employee' as UserType,
          };
        }
        return null;
      },
    },
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
};

// Utility functions
export function getUserTypeFromPath(pathname: string): UserType | null {
  if (pathname.startsWith('/employees')) return 'employee';
  if (pathname.startsWith('/clients')) return 'client';
  if (pathname.startsWith('/suppliers')) return 'supplier';
  if (pathname.startsWith('/professionals')) return 'professional';
  return null;
}

export function hasPermission(user: NexoUser | null, permission: string): boolean {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
}

export function isUserType(user: NexoUser | null, userType: UserType): boolean {
  return user?.userType === userType;
}

export function sharedAuth(): string {
  return 'shared-auth';
}

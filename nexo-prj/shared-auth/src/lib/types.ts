import type { DefaultSession } from 'next-auth';
import type { UserType, NexoUser } from './shared-auth.js';

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      userType: UserType;
      role?: string;
      permissions?: string[];
    } & DefaultSession['user'];
  }

  interface User extends NexoUser {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    userType: UserType;
    role?: string;
    permissions?: string[];
  }
}
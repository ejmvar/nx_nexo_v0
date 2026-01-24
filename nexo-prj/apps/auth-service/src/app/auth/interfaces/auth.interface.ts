export interface JwtPayload {
  sub: string; // User ID
  email: string;
  accountId: string; // Critical for RLS enforcement
  roleIds: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    account: {
      id: string;
      name: string;
      slug: string;
    };
    roles: Array<{
      id: string;
      name: string;
      permissions: any;
    }>;
  };
}

import NextAuth from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'nexo-frontend',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'your-client-secret',
      issuer: process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/nexo',
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken as string;
      (session as any).idToken = token.idToken as string;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
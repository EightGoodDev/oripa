import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no Node.js dependencies).
 * Used by middleware. Does NOT include adapter, Credentials provider, or DB calls.
 */
export const authEdgeConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.rank = token.rank as string;
        session.user.coins = token.coins as number;
        session.user.miles = token.miles as number;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isAdmin = request.nextUrl.pathname.startsWith("/admin");
      if (isAdmin && !auth?.user) {
        return false; // redirect to login
      }
      return true;
    },
  },
};

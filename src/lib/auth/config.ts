import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    // LINE Login - configured via custom provider
    {
      id: "line",
      name: "LINE",
      type: "oidc",
      issuer: "https://access.line.me",
      clientId: process.env.AUTH_LINE_ID,
      clientSecret: process.env.AUTH_LINE_SECRET,
      authorization: {
        params: { scope: "profile openid email" },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.hashedPassword) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          rank: user.rank,
          coins: user.coins,
          miles: user.miles,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? token.role ?? "USER";
        token.rank =
          (user as { rank?: string }).rank ?? token.rank ?? "BEGINNER";
        token.coins =
          (user as { coins?: number }).coins ?? token.coins ?? 0;
        token.miles =
          (user as { miles?: number }).miles ?? token.miles ?? 0;
      }

      const nowEpochSec = Math.floor(Date.now() / 1000);
      const lastRefreshed =
        typeof token.profileRefreshedAt === "number"
          ? token.profileRefreshedAt
          : 0;
      const shouldRefresh =
        Boolean(user) ||
        !token.role ||
        !token.rank ||
        typeof token.coins !== "number" ||
        typeof token.miles !== "number" ||
        nowEpochSec - lastRefreshed >= 300;

      // Keep sessions resilient even if DB is temporarily unavailable.
      if (token.id && shouldRefresh) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, rank: true, coins: true, miles: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.rank = dbUser.rank;
            token.coins = dbUser.coins;
            token.miles = dbUser.miles;
          }
          token.profileRefreshedAt = nowEpochSec;
        } catch (error) {
          console.error("[auth][jwt] user refresh failed", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "USER";
        session.user.rank = (token.rank as string) ?? "BEGINNER";
        session.user.coins =
          typeof token.coins === "number" ? token.coins : 0;
        session.user.miles =
          typeof token.miles === "number" ? token.miles : 0;
      }
      return session;
    },
  },
};

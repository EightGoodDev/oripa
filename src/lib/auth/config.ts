import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";
import { createTenantAwareAdapter } from "./tenant-adapter";

export const authConfig: NextAuthConfig = {
  adapter: createTenantAwareAdapter(prisma),
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
        loginScope: { label: "ログインスコープ", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const isAdminLogin = credentials.loginScope === "admin";
        const tenantId = await resolveTenantId();

        const user = await prisma.user.findFirst({
          where: isAdminLogin
            ? {
                email: credentials.email as string,
                role: { in: ["ADMIN", "SUPER_ADMIN"] },
              }
            : {
                email: credentials.email as string,
                tenantId,
                role: { in: ["USER", "ADMIN", "SUPER_ADMIN"] },
              },
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
          tenantId: user.tenantId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const currentTenantId = await resolveTenantId();

      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? token.role ?? "USER";
        token.rank =
          (user as { rank?: string }).rank ?? token.rank ?? "BEGINNER";
        token.coins =
          (user as { coins?: number }).coins ?? token.coins ?? 0;
        token.miles =
          (user as { miles?: number }).miles ?? token.miles ?? 0;
        token.tenantId =
          (user as { tenantId?: string }).tenantId ??
          token.tenantId ??
          currentTenantId;
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
        !token.tenantId ||
        nowEpochSec - lastRefreshed >= 300;

      // Keep sessions resilient even if DB is temporarily unavailable.
      if (token.id && shouldRefresh) {
        try {
          const tokenTenantId =
            typeof token.tenantId === "string" && token.tenantId.length > 0
              ? token.tenantId
              : currentTenantId;
          const dbUser = await prisma.user.findFirst({
            where: {
              id: token.id as string,
              tenantId: tokenTenantId,
            },
            select: {
              role: true,
              rank: true,
              coins: true,
              miles: true,
              tenantId: true,
            },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.rank = dbUser.rank;
            token.coins = dbUser.coins;
            token.miles = dbUser.miles;
            token.tenantId = dbUser.tenantId;
          } else {
            return {};
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
        session.user.tenantId = (token.tenantId as string) ?? "";
      }
      return session;
    },
  },
};

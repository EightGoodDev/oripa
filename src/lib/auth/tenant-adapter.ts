import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import type { PrismaClient } from "@prisma/client";
import { resolveTenantId } from "@/lib/tenant/context";

type AdapterMethod<T extends keyof Adapter> = NonNullable<Adapter[T]>;
type AdapterMethodResult<T extends keyof Adapter> = Awaited<
  ReturnType<AdapterMethod<T>>
>;

export function createTenantAwareAdapter(prisma: PrismaClient): Adapter {
  const baseAdapter = PrismaAdapter(prisma);

  return {
    ...baseAdapter,
    async createUser(data) {
      const tenantId = await resolveTenantId();
      return prisma.user.create({
        data: {
          ...data,
          tenantId,
        },
      }) as unknown as AdapterMethodResult<"createUser">;
    },
    async getUser(id) {
      const tenantId = await resolveTenantId();
      return prisma.user.findFirst({
        where: {
          id,
          tenantId,
        },
      }) as unknown as AdapterMethodResult<"getUser">;
    },
    async getUserByEmail(email) {
      const tenantId = await resolveTenantId();
      return prisma.user.findFirst({
        where: {
          email,
          tenantId,
        },
      }) as unknown as AdapterMethodResult<"getUserByEmail">;
    },
    async linkAccount(account) {
      const tenantId = await resolveTenantId();
      await prisma.account.create({
        data: {
          ...account,
          tenantId,
        },
      });
      return undefined;
    },
    async createSession(session) {
      const tenantId = await resolveTenantId();
      return prisma.session.create({
        data: {
          ...session,
          tenantId,
        },
      }) as unknown as AdapterMethodResult<"createSession">;
    },
    async getSessionAndUser(sessionToken) {
      const tenantId = await resolveTenantId();
      const row = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!row) return null;
      if (row.tenantId !== tenantId || row.user.tenantId !== tenantId) {
        return null;
      }
      return {
        session: row,
        user: row.user,
      } as unknown as AdapterMethodResult<"getSessionAndUser">;
    },
    async createVerificationToken(token) {
      const tenantId = await resolveTenantId();
      return prisma.verificationToken.create({
        data: {
          ...token,
          tenantId,
        },
      }) as unknown as AdapterMethodResult<"createVerificationToken">;
    },
  };
}

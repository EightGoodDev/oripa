import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { DEFAULT_TENANT_ID } from "@/lib/tenant/context";

export async function logAdminAction(
  adminId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, unknown>,
) {
  await prisma.adminAuditLog.create({
    data: {
      tenantId: DEFAULT_TENANT_ID,
      adminId,
      action,
      resource,
      resourceId,
      details: (details ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

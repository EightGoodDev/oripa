import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export async function logAdminAction(
  adminId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, unknown>,
) {
  await prisma.adminAuditLog.create({
    data: {
      adminId,
      action,
      resource,
      resourceId,
      details: (details ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

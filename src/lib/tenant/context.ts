export const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? "default";

export async function resolveTenantId(): Promise<string> {
  // Multi-tenant resolution is intentionally centralized here.
  // Current operation always uses the default tenant.
  return DEFAULT_TENANT_ID;
}

export function withTenant<T extends Record<string, unknown>>(
  tenantId: string,
  where: T = {} as T,
): T & { tenantId: string } {
  return {
    ...where,
    tenantId,
  };
}

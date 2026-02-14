import { Prisma } from "@prisma/client";

export interface ChargeRefundLog {
  refundId: string;
  amount: number;
  coinsRevoked: number;
  milesRevoked: number;
  reason: string;
  note: string | null;
  adminId: string;
  status: string;
  createdAt: string;
}

export interface ChargeRefundSummary {
  refundedAmount: number;
  refundedCoins: number;
  refundedMiles: number;
  logs: ChargeRefundLog[];
}

function isJsonObject(
  value: Prisma.JsonValue | null | undefined,
): value is Prisma.JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: Prisma.JsonValue | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asString(value: Prisma.JsonValue | undefined): string | null {
  return typeof value === "string" ? value : null;
}

export function parseChargeRefundSummary(
  metadata: Prisma.JsonValue | null | undefined,
): ChargeRefundSummary {
  if (!isJsonObject(metadata)) {
    return {
      refundedAmount: 0,
      refundedCoins: 0,
      refundedMiles: 0,
      logs: [],
    };
  }

  const refundsValue = metadata.refunds;
  if (!isJsonObject(refundsValue)) {
    return {
      refundedAmount: 0,
      refundedCoins: 0,
      refundedMiles: 0,
      logs: [],
    };
  }

  const logsValue = refundsValue.logs;
  const logs: ChargeRefundLog[] = Array.isArray(logsValue)
    ? logsValue
        .map((entry) => {
          if (!isJsonObject(entry)) return null;
          const refundId = asString(entry.refundId);
          const createdAt = asString(entry.createdAt);
          if (!refundId || !createdAt) return null;

          return {
            refundId,
            amount: asNumber(entry.amount),
            coinsRevoked: asNumber(entry.coinsRevoked),
            milesRevoked: asNumber(entry.milesRevoked),
            reason: asString(entry.reason) ?? "requested_by_customer",
            note: asString(entry.note),
            adminId: asString(entry.adminId) ?? "unknown",
            status: asString(entry.status) ?? "unknown",
            createdAt,
          } satisfies ChargeRefundLog;
        })
        .filter((row): row is ChargeRefundLog => row !== null)
    : [];

  return {
    refundedAmount: asNumber(refundsValue.refundedAmount),
    refundedCoins: asNumber(refundsValue.refundedCoins),
    refundedMiles: asNumber(refundsValue.refundedMiles),
    logs,
  };
}

export function mergeChargeRefundSummary(
  metadata: Prisma.JsonValue | null | undefined,
  summary: ChargeRefundSummary,
): Prisma.InputJsonValue {
  const baseObject: Prisma.JsonObject = isJsonObject(metadata)
    ? { ...metadata }
    : {};

  const nextLogs = summary.logs.map((log) => ({
    refundId: log.refundId,
    amount: log.amount,
    coinsRevoked: log.coinsRevoked,
    milesRevoked: log.milesRevoked,
    reason: log.reason,
    note: log.note,
    adminId: log.adminId,
    status: log.status,
    createdAt: log.createdAt,
  }));

  baseObject.refunds = {
    refundedAmount: summary.refundedAmount,
    refundedCoins: summary.refundedCoins,
    refundedMiles: summary.refundedMiles,
    logs: nextLogs,
  };

  return baseObject as Prisma.InputJsonValue;
}

import type { ConfigDomain, HomeEventDisplayType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

async function buildSnapshot(tenantId: string, domain: ConfigDomain) {
  switch (domain) {
    case "RANKS":
      return prisma.rankSetting.findMany({
        where: { tenantId },
        orderBy: { sortOrder: "asc" },
      });
    case "HOME_BANNERS":
      return prisma.homeBanner.findMany({
        where: { tenantId },
        orderBy: { sortOrder: "asc" },
      });
    case "HOME_EVENTS":
      return prisma.homeEvent.findMany({
        where: { tenantId },
        orderBy: { sortOrder: "asc" },
        include: {
          packs: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });
    case "MILE_REWARDS":
      return prisma.mileRewardItem.findMany({
        where: { tenantId },
        orderBy: { sortOrder: "asc" },
      });
    case "FEATURE_FLAGS":
      return prisma.tenantFeatureFlag.findMany({ where: { tenantId } });
    case "CONTENT_OVERRIDES":
      return prisma.tenantContentOverride.findMany({ where: { tenantId } });
    default:
      return [];
  }
}

function parseDate(input: unknown): Date | null {
  if (!input) return null;
  if (input instanceof Date) return input;
  const d = new Date(String(input));
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseEventDisplayType(input: unknown): HomeEventDisplayType {
  return input === "TEXT_FRAME" ? "TEXT_FRAME" : "IMAGE";
}

export async function publishConfigVersion(params: {
  tenantId: string;
  domain: ConfigDomain;
  publishedBy?: string;
  description?: string;
}) {
  const snapshot = await buildSnapshot(params.tenantId, params.domain);

  const latest = await prisma.tenantConfigVersion.findFirst({
    where: {
      tenantId: params.tenantId,
      domain: params.domain,
    },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  const version = (latest?.version ?? 0) + 1;

  const row = await prisma.tenantConfigVersion.create({
    data: {
      tenantId: params.tenantId,
      domain: params.domain,
      version,
      snapshot,
      publishedBy: params.publishedBy,
      description: params.description,
    },
  });

  return row;
}

export async function rollbackConfigVersion(params: {
  tenantId: string;
  domain: ConfigDomain;
  version: number;
  publishedBy?: string;
}) {
  const target = await prisma.tenantConfigVersion.findFirst({
    where: {
      tenantId: params.tenantId,
      domain: params.domain,
      version: params.version,
    },
  });

  if (!target) {
    throw new Error("指定バージョンが見つかりません");
  }

  const snapshot = target.snapshot;

  await prisma.$transaction(async (tx) => {
    if (params.domain === "RANKS") {
      await tx.rankSetting.deleteMany({ where: { tenantId: params.tenantId } });
      const rows = Array.isArray(snapshot) ? snapshot : [];
      for (const raw of rows) {
        const row = raw as Record<string, unknown>;
        await tx.rankSetting.create({
          data: {
            tenantId: params.tenantId,
            rank: String(row.rank) as never,
            chargeThreshold: Number(row.chargeThreshold ?? 0),
            coinReturnRate: Number(row.coinReturnRate ?? 0),
            mileReturnRate: Number(row.mileReturnRate ?? 0),
            rankUpBonus: Number(row.rankUpBonus ?? 0),
            sortOrder: Number(row.sortOrder ?? 0),
            isActive: Boolean(row.isActive ?? true),
            isPublished: Boolean(row.isPublished ?? true),
          },
        });
      }
    }

    if (params.domain === "HOME_BANNERS") {
      await tx.homeBanner.deleteMany({ where: { tenantId: params.tenantId } });
      const rows = Array.isArray(snapshot) ? snapshot : [];
      for (const raw of rows) {
        const row = raw as Record<string, unknown>;
        await tx.homeBanner.create({
          data: {
            tenantId: params.tenantId,
            title: row.title ? String(row.title) : null,
            imageUrl: String(row.imageUrl ?? ""),
            linkUrl: row.linkUrl ? String(row.linkUrl) : null,
            startsAt: parseDate(row.startsAt),
            endsAt: parseDate(row.endsAt),
            sortOrder: Number(row.sortOrder ?? 0),
            isActive: Boolean(row.isActive ?? true),
            isPublished: Boolean(row.isPublished ?? true),
          },
        });
      }
    }

    if (params.domain === "HOME_EVENTS") {
      await tx.homeEventPack.deleteMany({ where: { tenantId: params.tenantId } });
      await tx.homeEvent.deleteMany({ where: { tenantId: params.tenantId } });

      const rows = Array.isArray(snapshot) ? snapshot : [];
      for (const raw of rows) {
        const row = raw as Record<string, unknown>;
        const created = await tx.homeEvent.create({
          data: {
            tenantId: params.tenantId,
            title: String(row.title ?? ""),
            subtitle: row.subtitle ? String(row.subtitle) : null,
            description: String(row.description ?? ""),
            displayType: parseEventDisplayType(row.displayType),
            imageUrl: row.imageUrl ? String(row.imageUrl) : null,
            linkUrl: row.linkUrl ? String(row.linkUrl) : null,
            backgroundColor: row.backgroundColor ? String(row.backgroundColor) : null,
            borderColor: row.borderColor ? String(row.borderColor) : null,
            textColor: row.textColor ? String(row.textColor) : null,
            startsAt: parseDate(row.startsAt),
            endsAt: parseDate(row.endsAt),
            newUserOnly: Boolean(row.newUserOnly ?? false),
            sortOrder: Number(row.sortOrder ?? 0),
            isActive: Boolean(row.isActive ?? true),
            isPublished: Boolean(row.isPublished ?? true),
          },
        });

        const packRows = Array.isArray(row.packs) ? row.packs : [];
        for (const [idx, packRaw] of packRows.entries()) {
          const packRow = packRaw as Record<string, unknown>;
          const packId = String(packRow.packId ?? "");
          if (!packId) continue;

          await tx.homeEventPack.create({
            data: {
              tenantId: params.tenantId,
              homeEventId: created.id,
              packId,
              sortOrder: Number(packRow.sortOrder ?? idx),
            },
          });
        }
      }
    }

    if (params.domain === "MILE_REWARDS") {
      await tx.mileRewardItem.deleteMany({ where: { tenantId: params.tenantId } });
      const rows = Array.isArray(snapshot) ? snapshot : [];
      for (const raw of rows) {
        const row = raw as Record<string, unknown>;
        await tx.mileRewardItem.create({
          data: {
            tenantId: params.tenantId,
            name: String(row.name ?? ""),
            description: String(row.description ?? ""),
            imageUrl: String(row.imageUrl ?? ""),
            requiredMiles: Number(row.requiredMiles ?? 0),
            stock: row.stock === null || row.stock === undefined ? null : Number(row.stock),
            sortOrder: Number(row.sortOrder ?? 0),
            isActive: Boolean(row.isActive ?? true),
            isPublished: Boolean(row.isPublished ?? true),
          },
        });
      }
    }

    if (params.domain === "FEATURE_FLAGS") {
      await tx.tenantFeatureFlag.deleteMany({ where: { tenantId: params.tenantId } });
      const rows = Array.isArray(snapshot) ? snapshot : [];
      for (const raw of rows) {
        const row = raw as Record<string, unknown>;
        await tx.tenantFeatureFlag.create({
          data: {
            tenantId: params.tenantId,
            key: String(row.key ?? ""),
            valueBoolean:
              row.valueBoolean === null || row.valueBoolean === undefined
                ? null
                : Boolean(row.valueBoolean),
            valueString: row.valueString ? String(row.valueString) : null,
            isPublished: Boolean(row.isPublished ?? true),
          },
        });
      }
    }

    if (params.domain === "CONTENT_OVERRIDES") {
      await tx.tenantContentOverride.deleteMany({ where: { tenantId: params.tenantId } });
      const rows = Array.isArray(snapshot) ? snapshot : [];
      for (const raw of rows) {
        const row = raw as Record<string, unknown>;
        await tx.tenantContentOverride.create({
          data: {
            tenantId: params.tenantId,
            key: String(row.key ?? ""),
            value: String(row.value ?? ""),
            isPublished: Boolean(row.isPublished ?? true),
          },
        });
      }
    }
  });

  const latest = await prisma.tenantConfigVersion.findFirst({
    where: {
      tenantId: params.tenantId,
      domain: params.domain,
    },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  const newVersion = (latest?.version ?? 0) + 1;

  const published = await prisma.tenantConfigVersion.create({
    data: {
      tenantId: params.tenantId,
      domain: params.domain,
      version: newVersion,
      snapshot: await buildSnapshot(params.tenantId, params.domain),
      publishedBy: params.publishedBy,
      rolledBackFromVersion: params.version,
      description: `Rollback from v${params.version}`,
    },
  });

  return published;
}

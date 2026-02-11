import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { resolveTenantId } from "@/lib/tenant/context";

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = await resolveTenantId();

  const body = await req.json();
  const parsed = reorderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const requestedIds = parsed.data.ids;
  const categories = await prisma.packCategory.findMany({
    where: { tenantId, isActive: true },
    select: { id: true },
  });

  if (categories.length !== requestedIds.length) {
    return NextResponse.json(
      { error: "カテゴリ件数が一致しません" },
      { status: 400 },
    );
  }

  const existingIds = new Set(categories.map((category) => category.id));
  const uniqueRequestedIds = new Set(requestedIds);
  if (
    uniqueRequestedIds.size !== requestedIds.length ||
    requestedIds.some((id) => !existingIds.has(id))
  ) {
    return NextResponse.json(
      { error: "カテゴリIDが不正です" },
      { status: 400 },
    );
  }

  await prisma.$transaction(
    requestedIds.map((id, index) =>
      prisma.packCategory.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}

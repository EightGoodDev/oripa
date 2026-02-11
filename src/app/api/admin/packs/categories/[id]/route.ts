import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { resolveTenantId } from "@/lib/tenant/context";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = await resolveTenantId();

  const { id } = await params;

  const category = await prisma.packCategory.findFirst({
    where: { id, tenantId },
    select: { id: true, name: true },
  });

  if (!category) {
    return NextResponse.json(
      { error: "カテゴリが見つかりません" },
      { status: 404 },
    );
  }

  const usedCount = await prisma.oripaPack.count({
    where: { tenantId, category: category.name },
  });

  if (usedCount > 0) {
    return NextResponse.json(
      { error: "このカテゴリはパックで使用中のため削除できません" },
      { status: 400 },
    );
  }

  await prisma.packCategory.delete({
    where: { id: category.id },
  });

  return NextResponse.json({ success: true });
}

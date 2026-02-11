import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { resolveTenantId } from "@/lib/tenant/context";
import { z } from "zod";

const createPlanSchema = z.object({
  coins: z.coerce.number().int().min(1, "1以上を入力"),
  price: z.coerce.number().int().min(1, "1以上を入力"),
  bonus: z.coerce.number().int().min(0).default(0),
  isPopular: z.boolean().default(false),
  firstTimeOnly: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = await resolveTenantId();

  const plans = await prisma.chargePlan.findMany({
    where: { tenantId },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = await resolveTenantId();

  const body = await req.json();
  const parsed = createPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const plan = await prisma.chargePlan.create({
    data: {
      tenantId,
      coins: data.coins,
      price: data.price,
      bonus: data.bonus,
      isPopular: data.isPopular,
      firstTimeOnly: data.firstTimeOnly,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
  });

  await logAdminAction(session.user!.id, "CREATE", "chargePlan", plan.id);

  return NextResponse.json(plan, { status: 201 });
}

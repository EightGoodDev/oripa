import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { z } from "zod";

const createPackSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional().default(""),
  image: z.string().url("有効なURLを入力してください"),
  category: z.enum(["sneaker", "card", "figure", "game", "other"]),
  pricePerDraw: z.coerce.number().int().min(1, "1以上を入力"),
  totalStock: z.coerce.number().int().min(1, "1以上を入力"),
  limitPerUser: z.coerce.number().int().min(1).nullable().optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  featured: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (status) {
    where.status = status;
  }

  const packs = await prisma.oripaPack.findMany({
    where,
    include: {
      _count: { select: { packPrizes: true, draws: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(packs);
}

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const body = await req.json();
  const parsed = createPackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const pack = await prisma.oripaPack.create({
    data: {
      title: data.title,
      description: data.description,
      image: data.image,
      category: data.category,
      pricePerDraw: data.pricePerDraw,
      totalStock: data.totalStock,
      remainingStock: data.totalStock,
      limitPerUser: data.limitPerUser ?? null,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      featured: data.featured,
    },
  });

  await logAdminAction(session.user!.id, "CREATE", "oripaPack", pack.id);

  return NextResponse.json(pack, { status: 201 });
}

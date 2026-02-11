import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPackDetail } from "@/lib/db/queries";
import OripaDetailClient from "./OripaDetailClient";
import type { UserRank } from "@prisma/client";

export const revalidate = 10;
export const dynamic = "force-dynamic";

export default async function OripaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const pack = await getPackDetail(
    id,
    (session?.user?.rank as UserRank | undefined) ?? "BEGINNER",
  );

  if (!pack) {
    notFound();
  }

  return <OripaDetailClient pack={pack} />;
}

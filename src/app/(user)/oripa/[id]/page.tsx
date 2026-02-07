import { notFound } from "next/navigation";
import { getPackDetail } from "@/lib/db/queries";
import OripaDetailClient from "./OripaDetailClient";

export const revalidate = 10;

export default async function OripaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pack = await getPackDetail(id);

  if (!pack) {
    notFound();
  }

  return <OripaDetailClient pack={pack} />;
}

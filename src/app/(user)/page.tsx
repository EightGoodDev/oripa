import { auth } from "@/lib/auth";
import { getHomePageData } from "@/lib/db/queries";
import HomeClient from "./HomeClient";
import type { UserRank } from "@prisma/client";

export const revalidate = 30; // ISR: revalidate every 30 seconds
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const { packs, banners, events } = await getHomePageData({
    userId: session?.user?.id,
    userRank: (session?.user?.rank as UserRank | undefined) ?? "BEGINNER",
  });

  return <HomeClient packs={packs} banners={banners} events={events} />;
}

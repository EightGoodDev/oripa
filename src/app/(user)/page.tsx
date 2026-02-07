import { getActivePacks } from "@/lib/db/queries";
import HomeClient from "./HomeClient";

export const revalidate = 30; // ISR: revalidate every 30 seconds

export default async function HomePage() {
  const packs = await getActivePacks();

  return <HomeClient packs={packs} />;
}

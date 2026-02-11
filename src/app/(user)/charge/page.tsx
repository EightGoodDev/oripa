import { getChargePlans } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import ChargeClient from "./ChargeClient";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export default async function ChargePage() {
  const session = await auth();
  const plans = await getChargePlans(session?.user?.id);
  return <ChargeClient plans={plans} />;
}

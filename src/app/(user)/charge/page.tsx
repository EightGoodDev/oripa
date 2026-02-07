import { getChargePlans } from "@/lib/db/queries";
import ChargeClient from "./ChargeClient";

export const revalidate = 300;

export default async function ChargePage() {
  const plans = await getChargePlans();
  return <ChargeClient plans={plans} />;
}

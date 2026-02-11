import { redirect } from "next/navigation";

export default function ExchangeCompatPage() {
  redirect("/mypage?tab=exchange");
}

import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import MobileContainer from "@/components/layout/MobileContainer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <MobileContainer>{children}</MobileContainer>
      <BottomNav />
    </>
  );
}

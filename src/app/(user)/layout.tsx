import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import MobileContainer from "@/components/layout/MobileContainer";
import MobileLegalFooter from "@/components/layout/MobileLegalFooter";
import LegalReconsentGate from "@/components/legal/LegalReconsentGate";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <MobileContainer>
        {children}
        <MobileLegalFooter />
      </MobileContainer>
      <BottomNav />
      <LegalReconsentGate />
    </>
  );
}

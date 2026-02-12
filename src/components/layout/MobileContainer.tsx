import DesktopSideRail from "./DesktopSideRail";

export default function MobileContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full min-h-screen bg-[linear-gradient(180deg,_#334155_0%,_#1e293b_45%,_#0f172a_100%)] pb-20 lg:pb-8">
      <div className="w-full max-w-[1600px] mx-auto px-0 xl:px-4">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(220px,1fr)_minmax(0,736px)_minmax(220px,1fr)] xl:gap-4">
          <aside className="hidden xl:block">
            <DesktopSideRail side="left" />
          </aside>

          <section className="w-full max-w-[736px] min-w-0 mx-auto">
            {children}
          </section>

          <aside className="hidden xl:block">
            <DesktopSideRail side="right" />
          </aside>
        </div>
      </div>
    </main>
  );
}

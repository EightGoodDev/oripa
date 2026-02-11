export default function MobileContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full max-w-[1600px] mx-auto min-h-screen bg-gray-950 pb-20 lg:pb-8">
      {children}
    </main>
  );
}

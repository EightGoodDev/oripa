export default function MobileContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-950 pb-20">
      {children}
    </main>
  );
}

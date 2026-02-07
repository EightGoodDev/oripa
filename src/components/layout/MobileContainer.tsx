export default function MobileContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-md lg:max-w-4xl mx-auto min-h-screen bg-gray-950 pb-20 lg:pb-8">
      {children}
    </main>
  );
}

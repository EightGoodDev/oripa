import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  className?: string;
}

export default function StatCard({ title, value, sub, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-gray-900 border border-gray-800 rounded-xl p-5",
        className,
      )}
    >
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

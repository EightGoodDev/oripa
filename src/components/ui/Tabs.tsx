"use client";

interface TabsProps<T extends string> {
  tabs: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
}

export default function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: TabsProps<T>) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar px-4 py-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            active === tab.value
              ? "bg-yellow-400 text-gray-900"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

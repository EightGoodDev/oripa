"use client";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeHexColor(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : null;
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface TabColorStyle {
  backgroundColor?: string | null;
  textColor?: string | null;
}

interface TabsProps<T extends string> {
  tabs: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
  colorMap?: Record<string, TabColorStyle>;
}

export default function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  colorMap,
}: TabsProps<T>) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar px-4 py-2">
      {tabs.map((tab) => (
        (() => {
          const style = colorMap?.[String(tab.value)];
          const bgColor = normalizeHexColor(style?.backgroundColor);
          const textColor = normalizeHexColor(style?.textColor);
          const isActive = active === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-yellow-400 text-gray-900"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
              style={
                bgColor || textColor
                  ? {
                      backgroundColor: isActive
                        ? (bgColor ?? "#facc15")
                        : (bgColor ? hexToRgba(bgColor, 0.24) : "#1f2937"),
                      color: isActive
                        ? (textColor ?? "#111827")
                        : (textColor ?? "#9ca3af"),
                    }
                  : undefined
              }
            >
              {tab.label}
            </button>
          );
        })()
      ))}
    </div>
  );
}

function safeNumber(value: number | string | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function safeDate(value: Date | string | null | undefined): Date | null {
  const parsed = typeof value === "string" ? new Date(value) : value;
  if (!(parsed instanceof Date) || Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export function formatCoins(amount: number | string | null | undefined): string {
  return safeNumber(amount).toLocaleString("ja-JP");
}

export function formatPrice(amount: number | string | null | undefined): string {
  return `¥${safeNumber(amount).toLocaleString("ja-JP")}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  const d = safeDate(date);
  if (!d) return "-";

  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  const d = safeDate(date);
  if (!d) return "-";

  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(
  date: Date | string | null | undefined
): string {
  const d = safeDate(date);
  if (!d) return "-";

  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  return formatDate(d);
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  keyField?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  pageSize = 20,
  onRowClick,
  keyField = "id",
  emptyMessage = "データがありません",
  emptyAction,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rec = (row: T) => row as any;

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const aVal = rec(a)[sortKey];
        const bVal = rec(b)[sortKey];
        if (aVal == null || bVal == null) return 0;
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortAsc ? cmp : -cmp;
      })
    : data;

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
    setPage(0);
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-gray-400 font-medium",
                    col.sortable && "cursor-pointer select-none hover:text-white",
                    col.className,
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center"
                >
                  <p className="text-gray-500">{emptyMessage}</p>
                  {emptyAction && <div className="mt-3">{emptyAction}</div>}
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr
                  key={String(rec(row)[keyField])}
                  className={cn(
                    "border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors",
                    onRowClick && "cursor-pointer",
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3", col.className)}>
                      {col.render
                        ? col.render(row)
                        : String(rec(row)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
          <span className="text-sm text-gray-500">
            {data.length}件中 {page * pageSize + 1}-
            {Math.min((page + 1) * pageSize, data.length)}件
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              前へ
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              次へ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

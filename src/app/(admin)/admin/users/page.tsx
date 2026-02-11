"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import DataTable, { Column } from "@/components/admin/DataTable";
import { formatCoins, formatDate } from "@/lib/utils/format";
import { RANK_LABELS, RANK_COLORS } from "@/lib/utils/rank";
import type { UserRank } from "@/types";

type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  rank: UserRank;
  coins: number;
  isActive: boolean;
  createdAt: string;
  _count: { draws: number };
}

const ROLE_OPTIONS: UserRole[] = ["USER", "ADMIN", "SUPER_ADMIN"];
const RANK_OPTIONS: UserRank[] = [
  "BEGINNER",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
  "VIP",
];

const inputClass =
  "bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchUsers = useCallback(async (s: string, role: string, rank: string) => {
    const params = new URLSearchParams();
    if (s) params.set("search", s);
    if (role) params.set("role", role);
    if (rank) params.set("rank", rank);

    const res = await fetch(`/api/admin/users?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  }, []);

  // Debounced search
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetchUsers(search, roleFilter, rankFilter);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, roleFilter, rankFilter, fetchUsers]);

  const columns: Column<UserRow>[] = [
    {
      key: "name",
      label: "名前",
      render: (row) => (
        <span className={row.isActive ? "" : "text-gray-500 line-through"}>
          {row.name || "—"}
        </span>
      ),
    },
    {
      key: "email",
      label: "メール",
      render: (row) => (
        <span className="text-gray-400">{row.email || "—"}</span>
      ),
    },
    {
      key: "rank",
      label: "ランク",
      sortable: true,
      render: (row) => (
        <span
          className="text-xs font-bold px-2 py-0.5 rounded"
          style={{
            color: RANK_COLORS[row.rank],
            backgroundColor: `${RANK_COLORS[row.rank]}20`,
          }}
        >
          {RANK_LABELS[row.rank]}
        </span>
      ),
    },
    {
      key: "role",
      label: "ロール",
      sortable: true,
      render: (row) => (
        <span
          className={
            row.role === "SUPER_ADMIN"
              ? "text-red-400 text-xs font-bold"
              : row.role === "ADMIN"
                ? "text-yellow-400 text-xs font-bold"
                : "text-gray-400 text-xs"
          }
        >
          {row.role}
        </span>
      ),
    },
    {
      key: "coins",
      label: "コイン残高",
      sortable: true,
      render: (row) => formatCoins(row.coins),
    },
    {
      key: "_count",
      label: "ガチャ回数",
      render: (row) => formatCoins(row._count.draws),
    },
    {
      key: "createdAt",
      label: "登録日",
      sortable: true,
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ユーザー管理</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="名前・メールで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} pl-9`}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">全ロール</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={rankFilter}
          onChange={(e) => setRankFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">全ランク</option>
          {RANK_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {RANK_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-500">読み込み中...</div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            onRowClick={(row) =>
              router.push(`/admin/users/${(row as unknown as UserRow).id}`)
            }
            emptyMessage={
              search || roleFilter || rankFilter
                ? "条件に一致するユーザーがいません"
                : "ユーザーがまだいません。"
            }
          />
        )}
      </div>
    </div>
  );
}

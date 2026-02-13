"use client";

import { useEffect, useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import FormField from "@/components/admin/FormField";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { getCategoryLabel, type Rarity } from "@/types";
import { formatPrice } from "@/lib/utils/format";
import Breadcrumb from "@/components/admin/Breadcrumb";

const packSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional().default(""),
  image: z.string().url("有効なURLを入力してください"),
  category: z.string().trim().min(1, "カテゴリを入力してください"),
  minRank: z.enum(["BEGINNER", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "VIP"]).default("BEGINNER"),
  pricePerDraw: z.coerce.number().int().min(1),
  totalStock: z.coerce.number().int().min(1),
  limitPerUser: z.coerce
    .number()
    .int()
    .min(1)
    .nullable()
    .optional()
    .transform((v) => v || null),
  startsAt: z.string().optional().default(""),
  endsAt: z.string().optional().default(""),
  featured: z.boolean().optional().default(false),
  lastOnePrizeId: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().optional().default(0),
});

type PackForm = z.infer<typeof packSchema>;

interface PackPrizeItem {
  id: string;
  prizeId: string;
  weight: number;
  totalQuantity: number;
  remainingQuantity: number;
  prize: {
    id: string;
    name: string;
    image: string;
    genre: string;
    rarity: Rarity;
    marketPrice: number;
    costPrice: number;
    coinValue: number;
  };
}

interface PackData {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  minRank: "BEGINNER" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND" | "VIP";
  pricePerDraw: number;
  totalStock: number;
  remainingStock: number;
  status: string;
  featured: boolean;
  limitPerUser: number | null;
  startsAt: string | null;
  endsAt: string | null;
  lastOnePrizeId: string | null;
  sortOrder: number;
  packPrizes: PackPrizeItem[];
  _count: { draws: number };
}

interface PrizeOption {
  id: string;
  name: string;
  image: string;
  genre: string;
  rarity: Rarity;
  marketPrice: number;
  costPrice: number;
  coinValue: number;
  createdAt: string;
}

type PrizeSortKey = "newest" | "nameAsc" | "marketDesc" | "costDesc" | "rarityDesc";

interface DraftPrizeConfig {
  weight: number;
  totalQuantity: number;
}

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

function toLocalDatetime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function EditPackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [pack, setPack] = useState<PackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [prizeSectionOpen, setPrizeSectionOpen] = useState(true);
  const [removePrizeId, setRemovePrizeId] = useState<string | null>(null);
  const [allPrizes, setAllPrizes] = useState<PrizeOption[]>([]);
  const [selectedPrizeConfigs, setSelectedPrizeConfigs] = useState<
    Record<string, DraftPrizeConfig>
  >({});
  const [existingPrizeDrafts, setExistingPrizeDrafts] = useState<
    Record<string, DraftPrizeConfig>
  >({});
  const [savingPrizeRows, setSavingPrizeRows] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [addingPrize, setAddingPrize] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<"ACTIVE" | "ENDED" | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryModalError, setCategoryModalError] = useState("");
  const [prizeSearch, setPrizeSearch] = useState("");
  const [prizeRarityFilter, setPrizeRarityFilter] = useState<"" | Rarity>("");
  const [prizeGenreFilter, setPrizeGenreFilter] = useState("");
  const [prizeSort, setPrizeSort] = useState<PrizeSortKey>("newest");

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PackForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(packSchema) as any,
  });

  const imageUrl = watch("image") ?? "";
  const selectedCategory = watch("category") ?? "";
  const effectiveTotalStock = Number(watch("totalStock") || 0);
  const effectivePricePerDraw = Number(watch("pricePerDraw") || 0);

  const availablePrizes = useMemo(
    () =>
      allPrizes.filter(
        (prize) => !pack?.packPrizes.some((packPrize) => packPrize.prizeId === prize.id),
      ),
    [allPrizes, pack],
  );

  const genreOptions = useMemo(() => {
    const genres = new Set<string>();
    for (const prize of availablePrizes) {
      genres.add(prize.genre);
    }
    return Array.from(genres).sort((a, b) => a.localeCompare(b, "ja"));
  }, [availablePrizes]);

  const filteredAvailablePrizes = useMemo(() => {
    const keyword = prizeSearch.trim().toLocaleLowerCase("ja-JP");
    const rarityRank: Record<Rarity, number> = {
      N: 0,
      R: 1,
      SR: 2,
      SSR: 3,
      UR: 4,
    };

    const filtered = availablePrizes.filter((prize) => {
      if (keyword && !prize.name.toLocaleLowerCase("ja-JP").includes(keyword)) {
        return false;
      }
      if (prizeRarityFilter && prize.rarity !== prizeRarityFilter) return false;
      if (prizeGenreFilter && prize.genre !== prizeGenreFilter) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (prizeSort === "nameAsc") return a.name.localeCompare(b.name, "ja");
      if (prizeSort === "marketDesc") return b.marketPrice - a.marketPrice;
      if (prizeSort === "costDesc") return b.costPrice - a.costPrice;
      if (prizeSort === "rarityDesc") return rarityRank[b.rarity] - rarityRank[a.rarity];
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [availablePrizes, prizeGenreFilter, prizeRarityFilter, prizeSearch, prizeSort]);

  const selectedPrizeRows = useMemo(
    () =>
      Object.entries(selectedPrizeConfigs)
        .map(([prizeId, config]) => {
          const prize = availablePrizes.find((item) => item.id === prizeId);
          if (!prize) return null;
          return { prize, ...config };
        })
        .filter((row): row is { prize: PrizeOption; weight: number; totalQuantity: number } => !!row),
    [availablePrizes, selectedPrizeConfigs],
  );

  const fetchCategories = async (preferredName?: string) => {
    const res = await fetch("/api/admin/packs/categories");
    if (!res.ok) {
      setCategories([]);
      return;
    }

    const data: { id: string; name: string }[] = await res.json();
    setCategories(data);

    if (preferredName && data.some((c) => c.name === preferredName)) {
      setValue("category", preferredName, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const current = getValues("category");
    if (!current || !data.some((c) => c.name === current)) {
      setValue("category", data[0]?.name ?? "", { shouldValidate: true });
    }
  };

  async function fetchPack() {
    const res = await fetch(`/api/admin/packs/${id}`);
    if (!res.ok) {
      router.push("/admin/packs");
      return;
    }
    const data: PackData = await res.json();
    setPack(data);
    setExistingPrizeDrafts(
      Object.fromEntries(
        data.packPrizes.map((pp) => [
          pp.id,
          {
            weight: pp.weight,
            totalQuantity: pp.totalQuantity,
          },
        ]),
      ),
    );
    reset({
      title: data.title,
      description: data.description,
      image: data.image,
      category: data.category as PackForm["category"],
      minRank: data.minRank,
      pricePerDraw: data.pricePerDraw,
      totalStock: data.totalStock,
      limitPerUser: data.limitPerUser,
      startsAt: toLocalDatetime(data.startsAt),
      endsAt: toLocalDatetime(data.endsAt),
      featured: data.featured,
      lastOnePrizeId: data.lastOnePrizeId,
      sortOrder: data.sortOrder,
    });
    setLoading(false);
  }

  useEffect(() => {
    fetchPack();
    fetch("/api/admin/prizes")
      .then((r) => r.json())
      .then((data) => setAllPrizes(data));
    fetchCategories().catch(() => setCategories([]));
  }, [id]);

  async function onSubmit(data: PackForm) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/packs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startsAt: data.startsAt || null,
          endsAt: data.endsAt || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchPack();
      toast.success("保存しました");
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus: "ACTIVE" | "ENDED") {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/admin/packs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchPack();
        toast.success("ステータスを変更しました");
      } else {
        const err = await res.json();
        toast.error(err?.error || "ステータス変更に失敗しました");
      }
    } finally {
      setStatusUpdating(false);
      setStatusConfirmOpen(false);
      setNextStatus(null);
    }
  }

  const openStatusConfirm = (status: "ACTIVE" | "ENDED") => {
    setNextStatus(status);
    setStatusConfirmOpen(true);
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setCategoryModalError("カテゴリ名を入力してください");
      return;
    }

    const normalized = name.toLocaleLowerCase("ja-JP");
    if (categories.some((category) => category.name.toLocaleLowerCase("ja-JP") === normalized)) {
      setCategoryModalError("同じカテゴリ名がすでに存在します");
      return;
    }

    setCategoryModalError("");
    setCreatingCategory(true);
    try {
      const res = await fetch("/api/admin/packs/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await res.json();
      if (!res.ok) {
        setCategoryModalError(
          body?.error?.name?.[0] ?? body?.error ?? "カテゴリ作成に失敗しました",
        );
        return;
      }

      await fetchCategories(body.name);
      setNewCategoryName("");
      setCategoryModalError("");
      setCategoryModalOpen(false);
      toast.success("カテゴリを作成しました");
    } catch {
      setCategoryModalError("カテゴリ作成に失敗しました");
    } finally {
      setCreatingCategory(false);
    }
  };

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/packs/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "削除に失敗しました");
        return;
      }
      toast.success("パックを削除しました");
      router.push("/admin/packs");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  const togglePrizeSelection = (prizeId: string) => {
    setSelectedPrizeConfigs((prev) => {
      if (prev[prizeId]) {
        const next = { ...prev };
        delete next[prizeId];
        return next;
      }
      return {
        ...prev,
        [prizeId]: {
          weight: 1,
          totalQuantity: 1,
        },
      };
    });
  };

  const updateSelectedPrizeConfig = (
    prizeId: string,
    field: keyof DraftPrizeConfig,
    value: string,
  ) => {
    const normalized = Math.max(1, Number(value || 1));
    setSelectedPrizeConfigs((prev) => {
      if (!prev[prizeId]) return prev;
      return {
        ...prev,
        [prizeId]: {
          ...prev[prizeId],
          [field]: normalized,
        },
      };
    });
  };

  const clearSelectedPrizes = () => {
    setSelectedPrizeConfigs({});
  };

  const distributeRemainingQuantity = () => {
    if (selectedPrizeRows.length === 0) return;
    const remaining = Math.max(0, effectiveTotalStock - totalPrizeQuantity);
    if (remaining <= 0) return;

    const base = Math.floor(remaining / selectedPrizeRows.length);
    const remainder = remaining % selectedPrizeRows.length;

    setSelectedPrizeConfigs((prev) => {
      const next = { ...prev };
      selectedPrizeRows.forEach((row, index) => {
        next[row.prize.id] = {
          ...next[row.prize.id],
          totalQuantity: base + (index < remainder ? 1 : 0),
        };
      });
      return next;
    });
  };

  async function handleAddSelectedPrizes() {
    if (selectedPrizeRows.length === 0) {
      toast.error("追加する景品を選択してください");
      return;
    }

    setAddingPrize(true);
    try {
      const succeeded: string[] = [];
      const failedMessages: string[] = [];

      for (const row of selectedPrizeRows) {
        const res = await fetch(`/api/admin/packs/${id}/prizes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prizeId: row.prize.id,
            weight: row.weight,
            totalQuantity: row.totalQuantity,
          }),
        });

        if (res.ok) {
          succeeded.push(row.prize.id);
          continue;
        }

        const err = await res.json().catch(() => null);
        failedMessages.push(`${row.prize.name}: ${err?.error ?? "追加に失敗しました"}`);
      }

      if (succeeded.length > 0) {
        await fetchPack();
        setSelectedPrizeConfigs((prev) => {
          const next = { ...prev };
          for (const prizeId of succeeded) {
            delete next[prizeId];
          }
          return next;
        });
      }

      if (failedMessages.length > 0) {
        toast.error(`一部失敗しました（${failedMessages.length}件）`);
        return;
      }

      toast.success(`${succeeded.length}件の景品を追加しました`);
    } finally {
      setAddingPrize(false);
    }
  }

  async function handleRemovePrize() {
    if (!removePrizeId) return;
    const res = await fetch(
      `/api/admin/packs/${id}/prizes?packPrizeId=${removePrizeId}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "削除に失敗しました");
    } else {
      await fetchPack();
      toast.success("景品を削除しました");
    }
    setRemovePrizeId(null);
  }

  const updateExistingPrizeDraft = (
    packPrizeId: string,
    key: keyof DraftPrizeConfig,
    rawValue: string,
  ) => {
    const num = Number(rawValue);
    if (!Number.isFinite(num)) return;
    const sanitized = Math.max(1, Math.floor(num));
    setExistingPrizeDrafts((prev) => {
      const current = prev[packPrizeId] ?? { weight: 1, totalQuantity: 1 };
      return {
        ...prev,
        [packPrizeId]: {
          ...current,
          [key]: sanitized,
        },
      };
    });
  };

  async function saveExistingPrizeRows() {
    if (!pack || !isDraft) return;
    setSavingPrizeRows(true);
    try {
      const payload = pack.packPrizes.map((pp) => {
        const draft = existingPrizeDrafts[pp.id] ?? {
          weight: pp.weight,
          totalQuantity: pp.totalQuantity,
        };
        return {
          packPrizeId: pp.id,
          weight: draft.weight,
          totalQuantity: draft.totalQuantity,
        };
      });

      const res = await fetch(`/api/admin/packs/${id}/prizes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: payload }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "景品行の保存に失敗しました");
        return;
      }

      await fetchPack();
      toast.success("景品行を保存しました");
    } catch {
      toast.error("景品行の保存に失敗しました");
    } finally {
      setSavingPrizeRows(false);
    }
  }

  const totalWeight = (pack?.packPrizes ?? []).reduce((sum, pp) => {
    const draft = existingPrizeDrafts[pp.id];
    return sum + (draft?.weight ?? pp.weight);
  }, 0);
  const totalPrizeQuantity = (pack?.packPrizes ?? []).reduce(
    (sum, pp) => {
      const draft = existingPrizeDrafts[pp.id];
      return sum + (draft?.totalQuantity ?? pp.totalQuantity);
    },
    0,
  );
  const totalPrizeCost = (pack?.packPrizes ?? []).reduce(
    (sum, pp) => {
      const draft = existingPrizeDrafts[pp.id];
      return sum + (draft?.totalQuantity ?? pp.totalQuantity) * pp.prize.costPrice;
    },
    0,
  );
  const pendingPrizeQuantity = selectedPrizeRows.reduce(
    (sum, row) => sum + row.totalQuantity,
    0,
  );
  const pendingPrizeWeight = selectedPrizeRows.reduce((sum, row) => sum + row.weight, 0);
  const pendingPrizeCost = selectedPrizeRows.reduce(
    (sum, row) => sum + row.totalQuantity * row.prize.costPrice,
    0,
  );
  const simulatedPrizeQuantity = totalPrizeQuantity + pendingPrizeQuantity;
  const simulatedPrizeCost = totalPrizeCost + pendingPrizeCost;

  const stockDiff = effectiveTotalStock - totalPrizeQuantity;
  const simulatedStockDiff = effectiveTotalStock - simulatedPrizeQuantity;
  const isDraft = pack?.status === "DRAFT";
  const isEnded = pack?.status === "ENDED";
  const projectedRevenue = effectivePricePerDraw * effectiveTotalStock;
  const projectedProfit = projectedRevenue - simulatedPrizeCost;
  const projectedMargin = projectedRevenue > 0 ? (projectedProfit / projectedRevenue) * 100 : 0;
  const projectedCostRate = projectedRevenue > 0 ? (simulatedPrizeCost / projectedRevenue) * 100 : 0;
  const breakEvenDraws =
    effectivePricePerDraw > 0 ? Math.ceil(simulatedPrizeCost / effectivePricePerDraw) : 0;

  const publishChecks = useMemo(() => {
    if (!pack) return [];
    return [
      {
        label: "景品が1つ以上登録されている",
        ok: pack.packPrizes.length > 0,
      },
      {
        label: `景品合計数(${totalPrizeQuantity}) = 総在庫数(${effectiveTotalStock})`,
        ok: stockDiff === 0,
      },
      {
        label: "画像が設定されている",
        ok: !!pack.image && pack.image.startsWith("http"),
      },
      {
        label: "タイトルが設定されている",
        ok: !!pack.title && pack.title.length > 0,
      },
      {
        label: "1回あたりの価格が設定されている",
        ok: effectivePricePerDraw > 0,
      },
    ];
  }, [effectivePricePerDraw, effectiveTotalStock, pack, totalPrizeQuantity, stockDiff]);

  const canPublish = publishChecks.every((c) => c.ok);

  if (loading || !pack) {
    return <p className="text-center text-gray-500 py-20">読み込み中...</p>;
  }

  return (
    <div className="space-y-6 xl:pr-[23rem]">
      <Breadcrumb
        items={[
          { label: "パック管理", href: "/admin/packs" },
          { label: pack.title },
        ]}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">パック編集</h1>
        <div className="flex gap-2">
          {pack.status === "DRAFT" && (
            <Button size="sm" onClick={() => setPublishOpen(true)}>
              公開する
            </Button>
          )}
          {pack.status === "ACTIVE" && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => openStatusConfirm("ENDED")}
            >
              公開を終了
            </Button>
          )}
          {pack.status === "ENDED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openStatusConfirm("ACTIVE")}
            >
              公開を再開
            </Button>
          )}
          {(isDraft || isEnded) && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setDeleteOpen(true)}
            >
              削除
            </Button>
          )}
        </div>
      </div>

      <div className="xl:hidden sticky top-2 z-30 bg-gray-900/95 border border-gray-800 rounded-xl p-3 backdrop-blur">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">売上見込み</span>
          <span className="font-semibold">{formatPrice(projectedRevenue)}</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-gray-400">景品総原価（候補込み）</span>
          <span className="font-semibold">{formatPrice(simulatedPrizeCost)}</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-gray-400">利益率 / 原価率</span>
          <span className={projectedProfit >= 0 ? "text-green-400" : "text-red-400"}>
            {projectedMargin.toFixed(1)}% / {projectedCostRate.toFixed(1)}%
          </span>
        </div>
      </div>

      <aside className="hidden xl:block fixed right-6 top-24 z-40 w-[22rem]">
        <div className="bg-gray-900/95 border border-gray-700 rounded-2xl p-4 backdrop-blur space-y-3 shadow-2xl">
          <h2 className="text-sm font-bold text-gray-200">収支シミュレーション</h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-2">
              <p className="text-gray-400">売上見込み</p>
              <p className="font-semibold mt-1">{formatPrice(projectedRevenue)}</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-2">
              <p className="text-gray-400">景品総原価</p>
              <p className="font-semibold mt-1">{formatPrice(simulatedPrizeCost)}</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-2">
              <p className="text-gray-400">粗利</p>
              <p className={projectedProfit >= 0 ? "font-semibold mt-1 text-green-400" : "font-semibold mt-1 text-red-400"}>
                {formatPrice(projectedProfit)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-2">
              <p className="text-gray-400">利益率 / 原価率</p>
              <p className="font-semibold mt-1">
                {projectedMargin.toFixed(1)}% / {projectedCostRate.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-300 space-y-1">
            <p>損益分岐: 約{breakEvenDraws}口 / {effectiveTotalStock}口</p>
            <p>
              在庫差分: 現在 {stockDiff >= 0 ? `+${stockDiff}` : stockDiff}口 /
              候補込み {simulatedStockDiff >= 0 ? `+${simulatedStockDiff}` : simulatedStockDiff}口
            </p>
            <p>
              追加候補: {selectedPrizeRows.length}件（数量 +{pendingPrizeQuantity} / 原価 +{formatPrice(pendingPrizeCost)}）
            </p>
          </div>
        </div>
      </aside>

      {/* Stock validation banner */}
      {pack.packPrizes.length > 0 && stockDiff !== 0 && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            stockDiff > 0
              ? "border-yellow-600/50 bg-yellow-900/20 text-yellow-300"
              : "border-red-600/50 bg-red-900/20 text-red-300"
          }`}
        >
          <span className="text-lg mt-0.5">{stockDiff > 0 ? "⚠️" : "🚨"}</span>
          <div className="text-sm">
            <p className="font-bold">
              {stockDiff > 0
                ? "景品数が総在庫数より少ないです"
                : "景品数が総在庫数を超えています"}
            </p>
            <p className="mt-1 text-xs opacity-80">
              総在庫: {effectiveTotalStock}口 / 景品合計: {totalPrizeQuantity}口
              {stockDiff > 0
                ? ` (あと${stockDiff}口分の景品が必要)`
                : ` (${Math.abs(stockDiff)}口分超過)`}
            </p>
          </div>
        </div>
      )}

      {pack.packPrizes.length > 0 && stockDiff === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-green-600/50 bg-green-900/20 text-green-300 p-4">
          <span className="text-lg">✅</span>
          <p className="text-sm font-medium">
            在庫数一致: {effectiveTotalStock}口 = 景品合計 {totalPrizeQuantity}口
          </p>
        </div>
      )}

      {/* Pack form */}
      <form
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSubmit={handleSubmit(onSubmit as any)}
        className="max-w-2xl space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <FormField label="タイトル" error={errors.title?.message}>
          <input {...register("title")} className={inputClass} />
        </FormField>

        <FormField label="説明" error={errors.description?.message}>
          <textarea
            {...register("description")}
            rows={3}
            className={inputClass}
          />
        </FormField>

        <FormField label="画像" error={errors.image?.message}>
          <input type="hidden" {...register("image")} />
          <ImageUploadField
            value={imageUrl}
            onChange={(url) =>
              setValue("image", url, { shouldDirty: true, shouldValidate: true })
            }
            folder="packs"
            recommendedSize="1200 x 1200px（1:1）"
            disabled={saving}
            inputClassName={inputClass}
          />
        </FormField>

        <FormField label="カテゴリ" error={errors.category?.message}>
          <div className="flex gap-2">
            <input type="hidden" {...register("category")} />
            <select
              value={selectedCategory}
              onChange={(e) =>
                setValue("category", e.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className={inputClass}
            >
              {categories.length === 0 ? (
                <option value="">カテゴリを作成してください</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {getCategoryLabel(category.name)}
                  </option>
                ))
              )}
            </select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => {
                setCategoryModalError("");
                setCategoryModalOpen(true);
              }}
            >
              新規
            </Button>
          </div>
          <p className="mt-1 text-xs text-gray-500">カテゴリは事前登録が必要です。</p>
        </FormField>

        <FormField label="必要ランク">
          <select {...register("minRank")} className={inputClass}>
            <option value="BEGINNER">ビギナー以上</option>
            <option value="BRONZE">ブロンズ以上</option>
            <option value="SILVER">シルバー以上</option>
            <option value="GOLD">ゴールド以上</option>
            <option value="PLATINUM">プラチナ以上</option>
            <option value="DIAMOND">ダイヤモンド以上</option>
            <option value="VIP">???（シークレット）限定</option>
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="1回あたりの価格(コイン)"
            error={errors.pricePerDraw?.message}
          >
            <input
              type="number"
              {...register("pricePerDraw")}
              className={inputClass}
            />
          </FormField>
          <FormField label="総在庫数" error={errors.totalStock?.message}>
            <input
              type="number"
              {...register("totalStock")}
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField label="ユーザーあたりの制限(任意)">
          <input
            type="number"
            {...register("limitPerUser")}
            placeholder="制限なし"
            className={inputClass}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="開始日時(任意)">
            <input
              type="datetime-local"
              {...register("startsAt")}
              className={inputClass}
            />
          </FormField>
          <FormField label="終了日時(任意)">
            <input
              type="datetime-local"
              {...register("endsAt")}
              className={inputClass}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="表示順">
            <input
              type="number"
              {...register("sortOrder")}
              className={inputClass}
            />
          </FormField>
          <FormField label="ラストワン景品">
            <select {...register("lastOnePrizeId")} className={inputClass}>
              <option value="">なし</option>
              {pack.packPrizes.map((pp) => (
                <option key={pp.prize.id} value={pp.prize.id}>
                  {pp.prize.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              {...register("featured")}
              className="rounded border-gray-600 bg-gray-800 text-gold-mid focus:ring-gold-mid"
            />
            注目パックとして表示
          </label>
        </FormField>

        <div className="pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>

      {/* PackPrize management */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">景品一覧</h2>
            <p className="text-xs text-gray-400 mt-1">
              {totalPrizeQuantity} / {effectiveTotalStock}口 割当済
              {stockDiff > 0 && (
                <span className="text-yellow-400 ml-2">
                  (残り{stockDiff}口)
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {isDraft && (
              <Button
                size="sm"
                variant="outline"
                onClick={saveExistingPrizeRows}
                disabled={savingPrizeRows}
              >
                {savingPrizeRows ? "保存中..." : "景品行を保存"}
              </Button>
            )}
            <Button size="sm" onClick={() => setPrizeSectionOpen((v) => !v)}>
              {prizeSectionOpen ? "追加セクションを閉じる" : "景品追加を開く"}
            </Button>
          </div>
        </div>

        {pack.packPrizes.length === 0 ? (
          <p className="text-gray-500 text-sm">景品が追加されていません</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-3 py-2 text-gray-400 font-medium">景品名</th>
                <th className="px-3 py-2 text-gray-400 font-medium">
                  レアリティ
                </th>
                <th className="px-3 py-2 text-gray-400 font-medium">原価</th>
                <th className="px-3 py-2 text-gray-400 font-medium">重み</th>
                <th className="px-3 py-2 text-gray-400 font-medium">数量</th>
                <th className="px-3 py-2 text-gray-400 font-medium">確率</th>
                <th className="px-3 py-2 text-gray-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {pack.packPrizes.map((pp) => (
                <tr key={pp.id} className="border-b border-gray-800/50">
                  <td className="px-3 py-2">{pp.prize.name}</td>
                  <td className="px-3 py-2">
                    <Badge rarity={pp.prize.rarity} />
                  </td>
                  <td className="px-3 py-2">{formatPrice(pp.prize.costPrice)}</td>
                  <td className="px-3 py-2">
                    {isDraft ? (
                      <input
                        type="number"
                        min={1}
                        value={(existingPrizeDrafts[pp.id]?.weight ?? pp.weight).toString()}
                        onChange={(e) => updateExistingPrizeDraft(pp.id, "weight", e.target.value)}
                        className={inputClass}
                      />
                    ) : (
                      pp.weight
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isDraft ? (
                      <div className="space-y-1">
                        <input
                          type="number"
                          min={1}
                          value={(existingPrizeDrafts[pp.id]?.totalQuantity ?? pp.totalQuantity).toString()}
                          onChange={(e) =>
                            updateExistingPrizeDraft(pp.id, "totalQuantity", e.target.value)
                          }
                          className={inputClass}
                        />
                        <p className="text-[11px] text-gray-500">
                          残:{" "}
                          {Math.max(
                            0,
                            (existingPrizeDrafts[pp.id]?.totalQuantity ?? pp.totalQuantity) -
                              (pp.totalQuantity - pp.remainingQuantity),
                          )}{" "}
                          / 販売済: {pp.totalQuantity - pp.remainingQuantity}
                        </p>
                      </div>
                    ) : (
                      `${pp.remainingQuantity} / ${pp.totalQuantity}`
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {totalWeight > 0
                      ? `${((((existingPrizeDrafts[pp.id]?.weight ?? pp.weight) / totalWeight) * 100)).toFixed(2)}%`
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {isDraft && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setRemovePrizeId(pp.id)}
                      >
                        削除
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {prizeSectionOpen && (
          <div className="mt-6 border border-gray-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">景品を複数選択して追加</h3>
                <p className="text-xs text-gray-400 mt-1">
                  検索・絞り込みしながら選択し、右側で数量/重みを調整して一括追加できます
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={clearSelectedPrizes}>
                  選択クリア
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={distributeRemainingQuantity}
                  disabled={selectedPrizeRows.length === 0 || stockDiff <= 0}
                >
                  残り口数を均等配分
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={prizeSearch}
                    onChange={(e) => setPrizeSearch(e.target.value)}
                    placeholder="景品名で検索..."
                    className={inputClass}
                  />
                  <select
                    value={prizeGenreFilter}
                    onChange={(e) => setPrizeGenreFilter(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">すべてのジャンル</option>
                    {genreOptions.map((genre) => (
                      <option key={genre} value={genre}>
                        {getCategoryLabel(genre)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={prizeRarityFilter}
                    onChange={(e) => setPrizeRarityFilter(e.target.value as "" | Rarity)}
                    className={inputClass}
                  >
                    <option value="">すべてのレアリティ</option>
                    <option value="N">N</option>
                    <option value="R">R</option>
                    <option value="SR">SR</option>
                    <option value="SSR">SSR</option>
                    <option value="UR">UR</option>
                  </select>
                  <select
                    value={prizeSort}
                    onChange={(e) => setPrizeSort(e.target.value as PrizeSortKey)}
                    className={inputClass}
                  >
                    <option value="newest">新着順</option>
                    <option value="rarityDesc">レアリティ順</option>
                    <option value="marketDesc">市場価格順</option>
                    <option value="costDesc">原価順</option>
                    <option value="nameAsc">名前順</option>
                  </select>
                </div>

                <div className="max-h-[68vh] overflow-y-auto rounded-lg border border-gray-800 p-2">
                  {filteredAvailablePrizes.length === 0 ? (
                    <p className="text-sm text-gray-500 px-2 py-8 text-center">
                      条件に一致する景品がありません
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2">
                      {filteredAvailablePrizes.map((prize) => {
                        const isSelected = !!selectedPrizeConfigs[prize.id];
                        return (
                          <button
                            key={prize.id}
                            type="button"
                            onClick={() => togglePrizeSelection(prize.id)}
                            className={`text-left rounded-lg border p-2 transition-colors ${
                              isSelected
                                ? "border-gold-mid bg-gold-mid/10"
                                : "border-gray-800 hover:border-gray-600"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <img
                                src={prize.image}
                                alt={prize.name}
                                className="w-16 h-16 rounded object-cover border border-gray-700"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-medium truncate">{prize.name}</p>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded ${
                                      isSelected
                                        ? "bg-gold-mid text-gray-900"
                                        : "bg-gray-800 text-gray-400"
                                    }`}
                                  >
                                    {isSelected ? "選択中" : "未選択"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {getCategoryLabel(prize.genre)} / {prize.rarity}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  市場 {formatPrice(prize.marketPrice)} / 原価 {formatPrice(prize.costPrice)}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-3 h-fit xl:sticky xl:top-24 space-y-3">
                <h4 className="text-sm font-bold">選択中の追加設定</h4>
                {selectedPrizeRows.length === 0 ? (
                  <p className="text-xs text-gray-500">左の一覧から景品を選択してください</p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-[44vh] overflow-y-auto pr-1">
                      {selectedPrizeRows.map((row) => (
                        <div
                          key={row.prize.id}
                          className="rounded-lg border border-gray-800 p-2 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium truncate">{row.prize.name}</p>
                            <button
                              type="button"
                              className="text-[11px] text-red-400 hover:underline"
                              onClick={() => togglePrizeSelection(row.prize.id)}
                            >
                              外す
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="text-[11px] text-gray-400 space-y-1">
                              <span>重み</span>
                              <input
                                type="number"
                                min={1}
                                value={row.weight}
                                onChange={(e) =>
                                  updateSelectedPrizeConfig(row.prize.id, "weight", e.target.value)
                                }
                                className={inputClass}
                              />
                            </label>
                            <label className="text-[11px] text-gray-400 space-y-1">
                              <span>数量</span>
                              <input
                                type="number"
                                min={1}
                                value={row.totalQuantity}
                                onChange={(e) =>
                                  updateSelectedPrizeConfig(
                                    row.prize.id,
                                    "totalQuantity",
                                    e.target.value,
                                  )
                                }
                                className={inputClass}
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-gray-300 space-y-1 border-t border-gray-800 pt-3">
                      <p>選択件数: {selectedPrizeRows.length}件</p>
                      <p>追加数量合計: +{pendingPrizeQuantity}口</p>
                      <p>追加ウェイト合計: +{pendingPrizeWeight}</p>
                      <p>追加原価合計: +{formatPrice(pendingPrizeCost)}</p>
                      <p>
                        候補込み在庫差分:{" "}
                        <span className={simulatedStockDiff === 0 ? "text-green-400" : "text-yellow-400"}>
                          {simulatedStockDiff > 0 ? `+${simulatedStockDiff}` : simulatedStockDiff}
                        </span>
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddSelectedPrizes}
                      disabled={addingPrize}
                    >
                      {addingPrize
                        ? "一括追加中..."
                        : `${selectedPrizeRows.length}件を一括追加`}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete pack confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="パック削除"
        message="このパックを削除しますか？この操作は元に戻せません。"
        loading={deleting}
      />

      {/* Remove prize confirmation */}
      <ConfirmDialog
        isOpen={!!removePrizeId}
        onClose={() => setRemovePrizeId(null)}
        onConfirm={handleRemovePrize}
        title="景品削除"
        message="この景品をパックから削除しますか？"
      />

      <ConfirmDialog
        isOpen={statusConfirmOpen}
        onClose={() => {
          setStatusConfirmOpen(false);
          setNextStatus(null);
        }}
        onConfirm={() => {
          if (nextStatus) void handleStatusChange(nextStatus);
        }}
        title={nextStatus === "ENDED" ? "公開を終了" : "公開を再開"}
        message={
          nextStatus === "ENDED"
            ? "このパックの公開を終了します。ユーザーには表示されなくなります。後で再開可能です。"
            : "このパックの公開を再開します。ユーザーに再表示されます。"
        }
        confirmLabel={nextStatus === "ENDED" ? "終了する" : "再開する"}
        confirmVariant={nextStatus === "ENDED" ? "danger" : "gold"}
        loading={statusUpdating}
      />

      {/* Publish checklist modal */}
      <Modal isOpen={publishOpen} onClose={() => setPublishOpen(false)}>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md">
          <h3 className="text-lg font-bold mb-4">公開前チェックリスト</h3>
          <ul className="space-y-3 mb-6">
            {publishChecks.map((check, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className={`mt-0.5 ${check.ok ? "text-green-400" : "text-red-400"}`}>
                  {check.ok ? "✓" : "✗"}
                </span>
                <span className={check.ok ? "text-gray-300" : "text-red-300"}>
                  {check.label}
                </span>
              </li>
            ))}
          </ul>
          {!canPublish && (
            <p className="text-xs text-red-400 mb-4">
              すべての項目をクリアしてから公開してください
            </p>
          )}
          <div className="flex gap-3">
            <Button
              size="sm"
              disabled={!canPublish}
              onClick={async () => {
                setPublishOpen(false);
                await handleStatusChange("ACTIVE");
              }}
            >
              公開する
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPublishOpen(false)}
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setCategoryModalError("");
        }}
      >
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold">カテゴリ管理</h3>

          <div className="space-y-2">
            <label className="text-xs text-gray-400">新規カテゴリ名</label>
            <div className="flex gap-2">
              <input
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  if (categoryModalError) setCategoryModalError("");
                }}
                className={`${inputClass} flex-1`}
                placeholder="例: electronics"
              />
              <Button
                type="button"
                size="sm"
                className="shrink-0"
                onClick={handleCreateCategory}
                disabled={creatingCategory}
              >
                {creatingCategory ? "作成中..." : "作成"}
              </Button>
            </div>
            {categoryModalError && (
              <p className="text-xs text-red-400">{categoryModalError}</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-400">登録済みカテゴリ</p>
            <div className="max-h-60 overflow-y-auto border border-gray-800 rounded-lg">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="px-3 py-2 text-sm border-b border-gray-800 last:border-b-0"
                >
                  <span>{getCategoryLabel(category.name)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setCategoryModalOpen(false)}
            >
              閉じる
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

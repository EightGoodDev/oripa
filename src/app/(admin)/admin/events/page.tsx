"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/admin/Breadcrumb";
import {
  EventEditorFormFields,
  type EventForm,
  type EventFormUpdater,
  type PackOption,
  eventFormToPayload,
  extractEventErrorMessage,
  toDateTimeLocal,
  validateEventForm,
} from "@/components/admin/EventEditorForm";

interface EventRow {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  displayType: "IMAGE" | "TEXT_FRAME";
  imageUrl: string | null;
  linkUrl: string | null;
  backgroundColor: string | null;
  borderColor: string | null;
  textColor: string | null;
  startsAt: string | null;
  endsAt: string | null;
  newUserOnly: boolean;
  sortOrder: number;
  isActive: boolean;
  isPublished: boolean;
  packs: {
    pack: {
      id: string;
      title: string;
      image: string;
    };
  }[];
}

function rowToForm(row: EventRow): EventForm {
  return {
    title: row.title,
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    displayType: row.displayType ?? "IMAGE",
    imageUrl: row.imageUrl ?? "",
    linkUrl: row.linkUrl ?? "",
    backgroundColor: row.backgroundColor ?? "#4b1d1d",
    borderColor: row.borderColor ?? "#f59e0b",
    textColor: row.textColor ?? "#fff7ed",
    startsAt: toDateTimeLocal(row.startsAt),
    endsAt: toDateTimeLocal(row.endsAt),
    sortOrder: row.sortOrder ?? 0,
    newUserOnly: row.newUserOnly,
    isActive: row.isActive,
    isPublished: row.isPublished,
    packIds: row.packs.map((entry) => entry.pack.id),
  };
}

export default function EventsPage() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [packs, setPacks] = useState<PackOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EventForm | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    void fetchAll();
  }, []);

  const packMap = useMemo(
    () => new Map(packs.map((pack) => [pack.id, pack])),
    [packs],
  );
  const updateEditForm: EventFormUpdater = (updater) =>
    setEditForm((prev) => (prev ? updater(prev) : prev));

  async function fetchAll() {
    setLoading(true);
    const [eventsResult, packsResult] = await Promise.allSettled([
      fetch("/api/admin/events"),
      fetch("/api/admin/packs"),
    ]);

    let eventsError = false;
    let packsError = false;

    if (eventsResult.status === "fulfilled" && eventsResult.value.ok) {
      try {
        const eventsData = (await eventsResult.value.json()) as EventRow[];
        setRows(eventsData);
      } catch {
        eventsError = true;
        setRows([]);
      }
    } else {
      eventsError = true;
      setRows([]);
    }

    if (packsResult.status === "fulfilled" && packsResult.value.ok) {
      try {
        const packsData = (await packsResult.value.json()) as Array<{ id: string; title: string }>;
        setPacks(
          packsData
            .map((pack) => ({ id: pack.id, title: pack.title }))
            .sort((a, b) => a.title.localeCompare(b.title, "ja")),
        );
      } catch {
        packsError = true;
        setPacks([]);
      }
    } else {
      packsError = true;
      setPacks([]);
    }

    if (eventsError && packsError) {
      toast.error("イベント・パック情報の取得に失敗しました");
    } else if (eventsError) {
      toast.error("イベント情報の取得に失敗しました");
    } else if (packsError) {
      toast.error("パック情報の取得に失敗しました");
    }

    setLoading(false);
  }

  function beginEdit(row: EventRow) {
    setEditingId(row.id);
    setEditForm(rowToForm(row));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;

    const validation = validateEventForm(editForm);
    if (validation) {
      toast.error(validation);
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/events/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventFormToPayload(editForm)),
      });
      const body = await res.json();

      if (!res.ok) {
        toast.error(extractEventErrorMessage(body, "更新に失敗しました"));
        return;
      }

      toast.success("イベントを更新しました");
      cancelEdit();
      await fetchAll();
    } catch {
      toast.error("更新に失敗しました");
    } finally {
      setUpdating(false);
    }
  }

  async function deleteRow(id: string) {
    if (!window.confirm("削除しますか？")) return;
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    const body = await res.json();
    if (!res.ok) {
      toast.error(extractEventErrorMessage(body, "削除に失敗しました"));
      return;
    }

    toast.success("削除しました");
    if (editingId === id) cancelEdit();
    await fetchAll();
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "イベント管理" }]} />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">イベント一覧</h1>
        <Link href="/admin/events/new">
          <Button size="sm">新規イベント作成</Button>
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">読み込み中...</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">イベントがありません</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {rows.map((row) => {
              const isEditing = editingId === row.id;
              return (
                <div key={row.id} className="p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{row.title}</p>
                      <p className="text-xs text-gray-400">
                        タイプ: {row.displayType} / 公開: {row.isPublished ? "公開" : "下書き"} /
                        有効: {row.isActive ? "ON" : "OFF"}
                      </p>
                      <p className="text-xs text-gray-500">
                        期間: {row.startsAt ? new Date(row.startsAt).toLocaleString("ja-JP") : "未設定"} 〜{" "}
                        {row.endsAt ? new Date(row.endsAt).toLocaleString("ja-JP") : "未設定"} / 表示順:{" "}
                        {row.sortOrder}
                      </p>
                      <p className="text-xs text-gray-500">
                        遷移: {row.linkUrl || (row.packs[0] ? `/oripa/${row.packs[0].pack.id}` : "未設定")}
                      </p>
                      <p className="text-xs text-gray-500">
                        対象:{" "}
                        {row.packs.length > 0
                          ? row.packs
                              .map((entry) => packMap.get(entry.pack.id)?.title ?? entry.pack.title)
                              .join(" / ")
                          : "なし"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={isEditing ? "gold" : "outline"}
                        onClick={() => (isEditing ? cancelEdit() : beginEdit(row))}
                      >
                        {isEditing ? "編集を閉じる" : "編集"}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => deleteRow(row.id)}>
                        削除
                      </Button>
                    </div>
                  </div>

                  {isEditing && editForm && (
                    <div className="rounded-lg border border-gray-800 bg-gray-950/70 p-3 space-y-3">
                      <EventEditorFormFields form={editForm} setForm={updateEditForm} packs={packs} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} disabled={updating}>
                          {updating ? "更新中..." : "更新を保存"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} disabled={updating}>
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/admin/Breadcrumb";
import ImageUploadField from "@/components/admin/ImageUploadField";

type EventDisplayType = "IMAGE" | "TEXT_FRAME";

interface PackOption {
  id: string;
  title: string;
}

interface EventRow {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  displayType: EventDisplayType;
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

interface EventForm {
  title: string;
  subtitle: string;
  description: string;
  displayType: EventDisplayType;
  imageUrl: string;
  linkUrl: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  startsAt: string;
  endsAt: string;
  sortOrder: number;
  newUserOnly: boolean;
  isActive: boolean;
  isPublished: boolean;
  packIds: string[];
}

type FormUpdater = (updater: (prev: EventForm) => EventForm) => void;

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const DEFAULT_BG = "#4b1d1d";
const DEFAULT_BORDER = "#f59e0b";
const DEFAULT_TEXT = "#fff7ed";

const COLOR_PRESETS = [
  {
    name: "黄金",
    backgroundColor: "#4b1d1d",
    borderColor: "#f59e0b",
    textColor: "#fff7ed",
  },
  {
    name: "深海",
    backgroundColor: "#0f2a3d",
    borderColor: "#38bdf8",
    textColor: "#e0f2fe",
  },
  {
    name: "翡翠",
    backgroundColor: "#0f2f28",
    borderColor: "#34d399",
    textColor: "#ecfdf5",
  },
  {
    name: "夜桜",
    backgroundColor: "#3b1f47",
    borderColor: "#f472b6",
    textColor: "#fdf2f8",
  },
];

const initialForm: EventForm = {
  title: "",
  subtitle: "",
  description: "",
  displayType: "IMAGE",
  imageUrl: "",
  linkUrl: "",
  backgroundColor: DEFAULT_BG,
  borderColor: DEFAULT_BORDER,
  textColor: DEFAULT_TEXT,
  startsAt: "",
  endsAt: "",
  sortOrder: 0,
  newUserOnly: false,
  isActive: true,
  isPublished: false,
  packIds: [],
};

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function rowToForm(row: EventRow): EventForm {
  return {
    title: row.title,
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    displayType: row.displayType ?? "IMAGE",
    imageUrl: row.imageUrl ?? "",
    linkUrl: row.linkUrl ?? "",
    backgroundColor: row.backgroundColor ?? DEFAULT_BG,
    borderColor: row.borderColor ?? DEFAULT_BORDER,
    textColor: row.textColor ?? DEFAULT_TEXT,
    startsAt: toDateTimeLocal(row.startsAt),
    endsAt: toDateTimeLocal(row.endsAt),
    sortOrder: row.sortOrder ?? 0,
    newUserOnly: row.newUserOnly,
    isActive: row.isActive,
    isPublished: row.isPublished,
    packIds: row.packs.map((entry) => entry.pack.id),
  };
}

function extractErrorMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object") return fallback;
  const record = body as Record<string, unknown>;
  if (typeof record.error === "string") return record.error;
  if (record.error && typeof record.error === "object") {
    const fieldErrors = record.error as Record<string, unknown>;
    for (const value of Object.values(fieldErrors)) {
      if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    }
  }
  return fallback;
}

function normalizeColor(value: string, fallback: string) {
  const trimmed = value.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : fallback;
}

function EventPreview({
  form,
  packs,
}: {
  form: EventForm;
  packs: PackOption[];
}) {
  const selectedPacks = form.packIds
    .map((id) => packs.find((pack) => pack.id === id))
    .filter((pack): pack is PackOption => Boolean(pack));
  const backgroundColor = normalizeColor(form.backgroundColor, DEFAULT_BG);
  const borderColor = normalizeColor(form.borderColor, DEFAULT_BORDER);
  const textColor = normalizeColor(form.textColor, DEFAULT_TEXT);
  const hasImage = form.imageUrl.trim().length > 0;

  const heading = form.title.trim() || "イベントタイトル";
  const subtitle = form.subtitle.trim();
  const linkText = form.linkUrl.trim();

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-950/70 p-3 space-y-2">
      <p className="text-xs text-gray-400">リアルタイムプレビュー</p>
      <div
        className="rounded-xl border p-3"
        style={{
          backgroundColor,
          borderColor,
          color: textColor,
          backgroundImage:
            form.displayType === "IMAGE" && hasImage
              ? `linear-gradient(90deg, rgba(0,0,0,.72), rgba(0,0,0,.25)), url(${form.imageUrl.trim()})`
              : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p className="text-[11px] font-bold tracking-wide opacity-90">{form.displayType}</p>
        <h3 className="text-lg font-extrabold mt-1 break-words">{heading}</h3>
        {subtitle && <p className="text-sm mt-1 opacity-90 break-words">{subtitle}</p>}
        {form.description.trim() && (
          <p className="text-xs mt-2 opacity-80 break-words">{form.description.trim()}</p>
        )}

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {selectedPacks.length > 0 ? (
            selectedPacks.map((pack) => (
              <div
                key={pack.id}
                className="shrink-0 min-w-36 rounded-lg border border-white/25 bg-black/35 px-2 py-1.5 text-xs"
              >
                {pack.title}
              </div>
            ))
          ) : (
            <div className="text-xs opacity-75">対象パック未選択</div>
          )}
        </div>
      </div>
      <div className="text-[11px] text-gray-500 flex flex-wrap gap-3">
        <span>遷移先: {linkText || (selectedPacks[0] ? `/oripa/${selectedPacks[0].id}` : "未設定")}</span>
        <span>公開: {form.isPublished ? "公開" : "下書き"}</span>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  fallback,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fallback: string;
}) {
  const preview = normalizeColor(value, fallback);

  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#RRGGBB"
          className={inputClass}
        />
        <div
          className="w-8 h-8 rounded border border-gray-700 shrink-0"
          style={{ backgroundColor: preview }}
        />
      </div>
    </div>
  );
}

function EventFormFields({
  form,
  setForm,
  packs,
}: {
  form: EventForm;
  setForm: FormUpdater;
  packs: PackOption[];
}) {
  return (
    <div className="space-y-3">
      <input
        value={form.title}
        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        placeholder="タイトル（必須）"
        className={inputClass}
      />

      <textarea
        value={form.description}
        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        placeholder="説明（任意）"
        rows={3}
        className={inputClass}
      />

      <input
        value={form.subtitle}
        onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
        placeholder="サブタイトル（任意）"
        className={inputClass}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <select
          value={form.displayType}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              displayType: e.target.value as EventDisplayType,
            }))
          }
          className={inputClass}
        >
          <option value="IMAGE">IMAGE（画像イベント）</option>
          <option value="TEXT_FRAME">TEXT_FRAME（テキスト枠イベント）</option>
        </select>

        <input
          value={form.linkUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
          placeholder="リンクURL（https://... または /path）"
          className={inputClass}
        />
      </div>

      <ImageUploadField
        value={form.imageUrl}
        onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
        folder="packs"
        recommendedSize="1600 x 600px（8:3）"
        inputClassName={inputClass}
      />
      {form.displayType === "TEXT_FRAME" && (
        <p className="text-xs text-gray-500 -mt-2">
          TEXT_FRAMEでは画像は任意です（設定した場合は背景として利用されます）
        </p>
      )}

      <div className="space-y-2">
        <p className="text-xs text-gray-400">配色プリセット</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 hover:border-gold-mid"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  backgroundColor: preset.backgroundColor,
                  borderColor: preset.borderColor,
                  textColor: preset.textColor,
                }))
              }
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <ColorField
          label="背景色"
          value={form.backgroundColor}
          onChange={(value) => setForm((prev) => ({ ...prev, backgroundColor: value }))}
          fallback={DEFAULT_BG}
        />
        <ColorField
          label="枠色"
          value={form.borderColor}
          onChange={(value) => setForm((prev) => ({ ...prev, borderColor: value }))}
          fallback={DEFAULT_BORDER}
        />
        <ColorField
          label="文字色"
          value={form.textColor}
          onChange={(value) => setForm((prev) => ({ ...prev, textColor: value }))}
          fallback={DEFAULT_TEXT}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="datetime-local"
          value={form.startsAt}
          onChange={(e) => setForm((prev) => ({ ...prev, startsAt: e.target.value }))}
          className={inputClass}
        />
        <input
          type="datetime-local"
          value={form.endsAt}
          onChange={(e) => setForm((prev) => ({ ...prev, endsAt: e.target.value }))}
          className={inputClass}
        />
        <input
          type="number"
          min={0}
          value={form.sortOrder}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value || 0) }))
          }
          className={inputClass}
          placeholder="表示順"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <select
          value={form.isPublished ? "PUBLISHED" : "DRAFT"}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              isPublished: e.target.value === "PUBLISHED",
            }))
          }
          className={inputClass}
        >
          <option value="DRAFT">下書き</option>
          <option value="PUBLISHED">公開</option>
        </select>

        <label className="text-xs text-gray-300 flex items-center gap-2 px-2 py-2 rounded-lg border border-gray-800">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
          />
          有効状態
        </label>

        <label className="text-xs text-gray-300 flex items-center gap-2 px-2 py-2 rounded-lg border border-gray-800">
          <input
            type="checkbox"
            checked={form.newUserOnly}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, newUserOnly: e.target.checked }))
            }
          />
          新規ユーザー限定（初回ガチャ前）
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-400">対象パック（複数選択）</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-44 overflow-y-auto rounded-lg border border-gray-800 p-2">
          {packs.map((pack) => {
            const checked = form.packIds.includes(pack.id);
            return (
              <label
                key={pack.id}
                className="text-xs bg-gray-800 rounded p-2 flex gap-2 items-start"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      packIds: e.target.checked
                        ? [...prev.packIds, pack.id]
                        : prev.packIds.filter((id) => id !== pack.id),
                    }));
                  }}
                />
                <span>{pack.title}</span>
              </label>
            );
          })}
        </div>
      </div>

      <EventPreview form={form} packs={packs} />
    </div>
  );
}

export default function EventsPage() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [packs, setPacks] = useState<PackOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [createForm, setCreateForm] = useState<EventForm>(initialForm);
  const [creating, setCreating] = useState(false);

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
  const updateCreateForm: FormUpdater = (updater) => setCreateForm((prev) => updater(prev));
  const updateEditForm: FormUpdater = (updater) =>
    setEditForm((prev) => updater(prev ?? initialForm));

  async function fetchAll() {
    setLoading(true);
    try {
      const [eventsRes, packsRes] = await Promise.all([
        fetch("/api/admin/events"),
        fetch("/api/admin/packs"),
      ]);
      if (!eventsRes.ok || !packsRes.ok) throw new Error();

      const [eventsData, packsData]: [EventRow[], Array<{ id: string; title: string }>] =
        await Promise.all([eventsRes.json(), packsRes.json()]);

      setRows(eventsData);
      setPacks(
        packsData
          .map((pack) => ({ id: pack.id, title: pack.title }))
          .sort((a, b) => a.title.localeCompare(b.title, "ja")),
      );
    } catch {
      toast.error("イベント情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function validateForm(form: EventForm) {
    if (!form.title.trim()) {
      return "タイトルは必須です";
    }
    if (form.displayType === "IMAGE" && !form.imageUrl.trim()) {
      return "IMAGEタイプでは画像が必須です";
    }
    if (!form.linkUrl.trim() && form.packIds.length === 0) {
      return "対象パックかリンクURLのいずれかを設定してください";
    }

    const startsAt = form.startsAt ? new Date(form.startsAt) : null;
    const endsAt = form.endsAt ? new Date(form.endsAt) : null;
    if (startsAt && endsAt && startsAt > endsAt) {
      return "終了日時は開始日時より後にしてください";
    }

    const colors = [
      { label: "背景色", value: form.backgroundColor },
      { label: "枠色", value: form.borderColor },
      { label: "文字色", value: form.textColor },
    ];
    for (const color of colors) {
      const trimmed = color.value.trim();
      if (trimmed && !HEX_COLOR_PATTERN.test(trimmed)) {
        return `${color.label}は #RRGGBB 形式で入力してください`;
      }
    }

    return null;
  }

  function toPayload(form: EventForm) {
    return {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      displayType: form.displayType,
      imageUrl: form.imageUrl.trim(),
      linkUrl: form.linkUrl.trim(),
      backgroundColor: form.backgroundColor.trim(),
      borderColor: form.borderColor.trim(),
      textColor: form.textColor.trim(),
      startsAt: form.startsAt || "",
      endsAt: form.endsAt || "",
      newUserOnly: form.newUserOnly,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
      isPublished: form.isPublished,
      packIds: form.packIds,
    };
  }

  async function createEvent() {
    const validation = validateForm(createForm);
    if (validation) {
      toast.error(validation);
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(createForm)),
      });

      const body = await res.json();
      if (!res.ok) {
        toast.error(extractErrorMessage(body, "作成に失敗しました"));
        return;
      }

      toast.success("イベントを作成しました");
      setCreateForm(initialForm);
      await fetchAll();
    } catch {
      toast.error("作成に失敗しました");
    } finally {
      setCreating(false);
    }
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

    const validation = validateForm(editForm);
    if (validation) {
      toast.error(validation);
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/events/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(editForm)),
      });
      const body = await res.json();

      if (!res.ok) {
        toast.error(extractErrorMessage(body, "更新に失敗しました"));
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
      toast.error(extractErrorMessage(body, "削除に失敗しました"));
      return;
    }

    toast.success("削除しました");
    if (editingId === id) cancelEdit();
    await fetchAll();
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "イベント管理" }]} />
      <h1 className="text-2xl font-bold">イベント管理</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-bold">新規イベント作成</h2>
        <EventFormFields form={createForm} setForm={updateCreateForm} packs={packs} />
        <div className="flex gap-2">
          <Button size="sm" onClick={createEvent} disabled={creating}>
            {creating ? "作成中..." : "作成"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCreateForm(initialForm)}
            disabled={creating}
          >
            リセット
          </Button>
        </div>
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
                      <EventFormFields form={editForm} setForm={updateEditForm} packs={packs} />
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

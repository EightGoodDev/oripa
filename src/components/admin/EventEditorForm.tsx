"use client";

type EventDisplayType = "IMAGE" | "TEXT_FRAME";

export interface PackOption {
  id: string;
  title: string;
}

export interface EventForm {
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

export type EventFormUpdater = (updater: (prev: EventForm) => EventForm) => void;

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const DEFAULT_BG = "#4b1d1d";
const DEFAULT_BORDER = "#f59e0b";
const DEFAULT_TEXT = "#fff7ed";
const COLOR_SWATCHES = [
  "#111827",
  "#1f2937",
  "#4b1d1d",
  "#7c2d12",
  "#9a3412",
  "#7f1d1d",
  "#1e3a8a",
  "#0f766e",
  "#14532d",
  "#4c1d95",
  "#be185d",
  "#f59e0b",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#f43f5e",
  "#f8fafc",
];

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

export const initialEventForm: EventForm = {
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

export function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function extractEventErrorMessage(body: unknown, fallback: string) {
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

export function validateEventForm(form: EventForm) {
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

export function eventFormToPayload(form: EventForm) {
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

function normalizeColor(value: string, fallback: string) {
  const trimmed = value.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : fallback;
}

function normalizeColorForPicker(value: string, fallback: string) {
  const normalized = normalizeColor(value, fallback).toLowerCase();
  if (normalized.length === 4) {
    const r = normalized[1];
    const g = normalized[2];
    const b = normalized[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return normalized;
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
        <p className="text-[11px] font-bold tracking-wide opacity-90 text-center">{form.displayType}</p>
        <h3 className="text-lg font-extrabold mt-1 break-words text-center">{heading}</h3>
        {subtitle && <p className="text-sm mt-1 opacity-90 break-words text-center">{subtitle}</p>}
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
  const pickerValue = normalizeColorForPicker(value, fallback);

  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded border border-gray-700 bg-gray-900 cursor-pointer"
          aria-label={`${label}を選択`}
        />
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
      <div className="flex flex-wrap gap-1.5">
        {COLOR_SWATCHES.map((swatch) => {
          const isActive = normalizeColorForPicker(preview, fallback) === swatch;
          return (
            <button
              key={`${label}-${swatch}`}
              type="button"
              aria-label={`${label} ${swatch}`}
              onClick={() => onChange(swatch)}
              className={`h-5 w-5 rounded border ${isActive ? "border-white" : "border-gray-700"}`}
              style={{ backgroundColor: swatch }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function EventEditorFormFields({
  form,
  setForm,
  packs,
}: {
  form: EventForm;
  setForm: EventFormUpdater;
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

      <div className="space-y-1">
        <label className="text-xs text-gray-400">画像URL（IMAGEは必須）</label>
        <input
          value={form.imageUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

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

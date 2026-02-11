"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  folder: "packs" | "prizes";
  disabled?: boolean;
  placeholder?: string;
  inputClassName?: string;
}

export default function ImageUploadField({
  value,
  onChange,
  folder,
  disabled = false,
  placeholder = "https://...",
  inputClassName = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid",
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/uploads/image", {
        method: "POST",
        body: formData,
      });

      const body = await res.json();

      if (!res.ok) {
        const message = body?.error ?? "画像アップロードに失敗しました";
        setUploadError(message);
        toast.error(message);
        return;
      }

      if (!body?.url || typeof body.url !== "string") {
        setUploadError("アップロードURLの取得に失敗しました");
        toast.error("アップロードURLの取得に失敗しました");
        return;
      }

      onChange(body.url);
      toast.success("画像をアップロードしました");
    } catch {
      setUploadError("画像アップロードに失敗しました");
      toast.error("画像アップロードに失敗しました");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePickFile}
          disabled={disabled || uploading}
          className="h-9 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-sm text-white transition-colors"
        >
          {uploading ? "アップロード中..." : "画像をアップロード"}
        </button>
        <span className="text-xs text-gray-400">PNG/JPEG/WEBP/GIF (5MBまで)</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
        disabled={disabled || uploading}
      />

      {uploadError && (
        <p className="text-xs text-red-400">{uploadError}</p>
      )}

      {value && /^https?:\/\/.+/.test(value) && (
        <div>
          <img
            src={value}
            alt="プレビュー"
            className="w-32 h-32 object-cover rounded-lg border border-gray-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}

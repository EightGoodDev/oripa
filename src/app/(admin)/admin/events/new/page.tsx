"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Breadcrumb from "@/components/admin/Breadcrumb";
import Button from "@/components/ui/Button";
import {
  EventEditorFormFields,
  type EventFormUpdater,
  type PackOption,
  eventFormToPayload,
  extractEventErrorMessage,
  initialEventForm,
  validateEventForm,
} from "@/components/admin/EventEditorForm";

export default function NewEventPage() {
  const [packs, setPacks] = useState<PackOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(initialEventForm);

  const updateForm: EventFormUpdater = (updater) => setForm((prev) => updater(prev));

  useEffect(() => {
    void fetchPacks();
  }, []);

  async function fetchPacks() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packs");
      if (!res.ok) throw new Error();
      const packsData = (await res.json()) as Array<{
        id: string;
        title: string;
        status: string;
      }>;
      setPacks(
        packsData
          .map((pack) => ({ id: pack.id, title: pack.title, status: pack.status }))
          .sort((a, b) => a.title.localeCompare(b.title, "ja")),
      );
    } catch {
      toast.error("パック情報の取得に失敗しました");
      setPacks([]);
    } finally {
      setLoading(false);
    }
  }

  async function createEvent() {
    const validation = validateEventForm(form, packs);
    if (validation) {
      toast.error(validation);
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventFormToPayload(form)),
      });

      const body = await res.json();
      if (!res.ok) {
        toast.error(extractEventErrorMessage(body, "作成に失敗しました"));
        return;
      }

      toast.success("イベントを作成しました");
      setForm(initialEventForm);
    } catch {
      toast.error("作成に失敗しました");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "イベント管理", href: "/admin/events" },
          { label: "新規作成" },
        ]}
      />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">イベント新規作成</h1>
        <Link href="/admin/events">
          <Button size="sm" variant="outline">
            一覧へ戻る
          </Button>
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">読み込み中...</p>
        ) : (
          <>
            <EventEditorFormFields form={form} setForm={updateForm} packs={packs} />
            <div className="flex gap-2">
              <Button size="sm" onClick={createEvent} disabled={creating}>
                {creating ? "作成中..." : "作成"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setForm(initialEventForm)}
                disabled={creating}
              >
                リセット
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

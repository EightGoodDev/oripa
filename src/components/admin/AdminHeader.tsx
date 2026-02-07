"use client";

import { useSession, signOut } from "next-auth/react";
import Button from "@/components/ui/Button";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-end px-6 gap-4">
      <span className="text-sm text-gray-400">
        {session?.user?.name ?? "管理者"}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        ログアウト
      </Button>
    </header>
  );
}

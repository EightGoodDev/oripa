import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session;
}

export async function requireSuperAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SUPER_ADMIN") {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session;
}

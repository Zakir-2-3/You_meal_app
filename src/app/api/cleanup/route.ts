import { NextResponse } from "next/server";

import { cleanupOldUsers } from "@/lib/cleanupOldUsers";

export async function POST() {
  try {
    await cleanupOldUsers();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка очистки:", error);
    return NextResponse.json({ error: "Очистка не удалась" }, { status: 500 });
  }
}

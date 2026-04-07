import { NextResponse } from "next/server";

import { cleanupOldUsers } from "@/lib/user/cleanupOldUsers";

export async function POST() {
  try {
    await cleanupOldUsers();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Cleaning failed" }, { status: 500 });
  }
}

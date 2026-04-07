import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/supabaseAdminClient";

export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: "No file name" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.storage
      .from("avatars")
      .remove([fileName]);

    if (error) {
      console.error("File deletion error:", error.message);
      return NextResponse.json({ error: "Uninstall error" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

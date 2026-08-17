import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/supabaseAdminClient";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Получаем список всех файлов
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from("avatars")
      .list();

    if (listError) {
      console.error("Avatar list error:", listError.message);
      return NextResponse.json(
        { error: "Failed to list avatars" },
        { status: 500 },
      );
    }

    // Фильтруем файлы, начинающиеся с email_
    const userFiles =
      files
        ?.filter((file) => file.name.startsWith(`${email}_`))
        .map((file) => file.name) || [];

    // Удаляем все найденные файлы
    if (userFiles.length > 0) {
      const { error: removeError } = await supabaseAdmin.storage
        .from("avatars")
        .remove(userFiles);

      if (removeError) {
        console.error("Avatar remove error:", removeError.message);
        return NextResponse.json(
          { error: "Failed to remove avatars" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true, deletedCount: userFiles.length });
  } catch (err) {
    console.error("Clear avatars error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

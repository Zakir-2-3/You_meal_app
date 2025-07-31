import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: "Нет имени файла" }, { status: 400 });
    }

    const { error } = await supabase.storage.from("avatars").remove([fileName]);

    if (error) {
      console.error("Ошибка удаления файла:", error.message);
      return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Серверная ошибка:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

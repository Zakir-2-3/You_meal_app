import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
  }

  // Удаление из users
  const { error } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("email", email);

  if (error) {
    console.error("Ошибка при удалении пользователя:", error.message);
    return NextResponse.json({ error: "Ошибка при удалении" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

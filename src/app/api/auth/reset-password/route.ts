import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { cleanupOldUsers } from "@/lib/user/cleanupOldUsers";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdminClient";
import { checkPasswordMatch } from "@/lib/user/checkPasswordMatch";

export async function POST(req: Request) {
  try {
    await cleanupOldUsers();

    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { message: "Insufficient data" },
        { status: 400 },
      );
    }

    const { data: record, error: findError } = await supabaseAdmin
      .from("VerificationCode")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("purpose", "recovery")
      .maybeSingle();

    if (findError || !record) {
      return NextResponse.json({ message: "INVALID_CODE" }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(record.expires_at);
    if (expiresAt < now) {
      return NextResponse.json({ message: "CODE_EXPIRED" }, { status: 400 });
    }

    // Проверка, новый пароль не совпадает с текущим
    const isSame = await checkPasswordMatch(email, newPassword);
    if (isSame) {
      return NextResponse.json(
        { message: "PASSWORD_SAME_AS_CURRENT" },
        { status: 400 },
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password: hashedPassword })
      .eq("email", email);

    if (updateError) {
      console.error("Password update error:", updateError.message);
      return NextResponse.json(
        { message: "Failed to update password" },
        { status: 500 },
      );
    }

    // Удаляем VerificationCode
    const { error: deleteError } = await supabaseAdmin
      .from("VerificationCode")
      .delete()
      .eq("email", email)
      .eq("purpose", "recovery");

    if (deleteError) {
      console.warn("Failed to remove code:", deleteError.message);
    }

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error in reset-password:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

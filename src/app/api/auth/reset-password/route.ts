import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { supabase } from "@/lib/supabase/supabaseClient";
import { checkPasswordMatch } from "@/lib/user/checkPasswordMatch";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { message: "Insufficient data" },
        { status: 400 },
      );
    }

    const { data: record, error: findError } = await supabase
      .from("VerificationCode")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("purpose", "recovery")
      .maybeSingle();

    if (findError || !record) {
      return NextResponse.json({ message: "Invalid code" }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(record.expires_at);
    if (expiresAt < now) {
      return NextResponse.json(
        { message: "The code has expired" },
        { status: 400 },
      );
    }

    // Проверка, новый пароль не совпадает с текущим
    const isSame = await checkPasswordMatch(email, newPassword);
    if (isSame) {
      return NextResponse.json(
        { message: "The new password must not match the current one." },
        { status: 400 },
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль
    const { error: updateError } = await supabase
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
    const { error: deleteError } = await supabase
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

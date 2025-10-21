import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { supabase } from "@/lib/supabaseClient";
import { checkPasswordMatch } from "@/lib/checkPasswordMatch";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { message: "Недостаточно данных" },
        { status: 400 }
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
      return NextResponse.json({ message: "Неверный код" }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(record.expires_at);
    if (expiresAt < now) {
      return NextResponse.json(
        { message: "Срок действия кода истёк" },
        { status: 400 }
      );
    }

    // Проверка, новый пароль не совпадает с текущим
    const isSame = await checkPasswordMatch(email, newPassword);
    if (isSame) {
      return NextResponse.json(
        { message: "Новый пароль не должен совпадать с текущим" },
        { status: 400 }
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
      console.error("Ошибка обновления пароля:", updateError.message);
      return NextResponse.json(
        { message: "Не удалось обновить пароль" },
        { status: 500 }
      );
    }

    // Удаляем VerificationCode
    const { error: deleteError } = await supabase
      .from("VerificationCode")
      .delete()
      .eq("email", email)
      .eq("purpose", "recovery");

    if (deleteError) {
      console.warn("Не удалось удалить код:", deleteError.message);
    }

    return NextResponse.json({ message: "Пароль успешно обновлён" });
  } catch (err) {
    console.error("Ошибка в reset-password:", err);
    return NextResponse.json({ message: "Ошибка на сервере" }, { status: 500 });
  }
}

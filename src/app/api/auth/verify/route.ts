import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, code, city } = body;

    if (!email || !code) {
      console.log("Нет email или кода в запросе");
      return NextResponse.json(
        { error: "Email и код обязательны" },
        { status: 400 }
      );
    }

    const { data: record, error } = await supabase
      .from("VerificationCode")
      .select("*")
      .eq("email", email)
      .eq("purpose", "register")
      .single();

    if (error) {
      console.error("Ошибка поиска в VerificationCode:", error.message);
    }

    if (!record) {
      console.log("Не найдена запись для этой почты");
      return NextResponse.json({ error: "Неверный код" }, { status: 400 });
    }

    if (record.code !== String(code)) {
      console.log("Код не совпадает", {
        codeFromDB: record.code,
        codeReceived: code,
      });
      return NextResponse.json({ error: "Неверный код" }, { status: 400 });
    }

    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      console.log("Код просрочен");
      return NextResponse.json(
        { error: "Срок действия кода истёк" },
        { status: 400 }
      );
    }

    // Создаём пользователя
    const { error: insertError } = await supabase.from("users").insert({
      email: record.email,
      name: record.name,
      password: record.password,
      isVerified: true,
      balance: 0,
      cart: [],
      promoCodes: [],
      avatar: "",
      city: city || "",
    });

    if (insertError) {
      console.error("Ошибка создания пользователя:", insertError.message);
      return NextResponse.json(
        { error: "Ошибка создания пользователя" },
        { status: 500 }
      );
    }

    // Удаляем временную запись
    const { error: deleteError } = await supabase
      .from("VerificationCode")
      .delete()
      .eq("email", email);

    if (deleteError) {
      console.error("Ошибка удаления VerificationCode:", deleteError.message);
    }

    return NextResponse.json({ message: "Почта подтверждена, аккаунт создан" });
  } catch (error) {
    console.error("Ошибка верификации:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

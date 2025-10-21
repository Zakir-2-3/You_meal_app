import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { supabase } from "@/lib/supabaseClient";
import { cleanupOldUsers } from "@/lib/cleanupOldUsers";

export async function POST(req: Request) {
  try {
    // Удаляем старых пользователей (старше 1 месяца) и аватарки
    await cleanupOldUsers();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { code: "missing_fields", message: "Email и пароль обязательны" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password, name")
      .eq("email", email)
      .single();

    if (error || !user || !user.password) {
      return NextResponse.json(
        { code: "email_not_found", message: "Почта не найдена" },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { code: "invalid_password", message: "Неверный пароль" },
        { status: 401 }
      );
    }

    // Удаляем recovery-код, если пользователь вспомнил пароль и вошёл
    await supabase
      .from("VerificationCode")
      .delete()
      .eq("email", email)
      .eq("purpose", "recovery");

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { code: "server_error", message: "Ошибка сервера при входе" },
      { status: 500 }
    );
  }
}

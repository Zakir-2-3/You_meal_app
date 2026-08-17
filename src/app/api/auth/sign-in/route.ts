import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { cleanupOldUsers } from "@/lib/user/cleanupOldUsers";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdminClient";

export async function POST(req: Request) {
  try {
    // Удаляем старых пользователей (старше 1 месяца) и аватарки
    await cleanupOldUsers();

    // Удаляем временные данные из VerificationCode, если им >2 часов
    await supabaseAdmin
      .from("VerificationCode")
      .delete()
      .lt("createdAt", new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ code: "missing_fields" }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, email, password, name")
      .eq("email", email)
      .single();

    if (error || !user || !user.password) {
      return NextResponse.json({ code: "email_not_found" }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ code: "invalid_password" }, { status: 401 });
    }

    // Удаляем recovery-код, если пользователь вспомнил пароль и вошёл
    await supabaseAdmin
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
    console.error("Sign in error:", error);
    return NextResponse.json({ code: "server_error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { supabase } from "@/lib/supabaseClient";
import { checkPasswordMatch } from "@/lib/checkPasswordMatch";

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const isSamePassword = await checkPasswordMatch(email, newPassword);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "Новый пароль не должен совпадать с текущим" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashed })
      .eq("email", email);

    if (updateError) {
      console.error("Ошибка обновления пароля:", updateError.message);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

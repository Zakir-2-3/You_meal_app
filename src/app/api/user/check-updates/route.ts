import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabaseClient";
import { checkPasswordMatch } from "@/lib/checkPasswordMatch";

export async function POST(req: Request) {
  try {
    const { email, newName, newPassword } = await req.json();

    const { data: user, error } = await supabase
      .from("users")
      .select("name")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { message: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const nameSame = newName ? newName === user.name : false;

    let passwordSame = false;
    if (newPassword) {
      try {
        passwordSame = await checkPasswordMatch(email, newPassword);
      } catch {
        return NextResponse.json(
          { message: "Ошибка при проверке пароля" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ nameSame, passwordSame });
  } catch (err) {
    console.error("Ошибка проверки данных:", err);
    return NextResponse.json(
      { message: "Ошибка проверки данных" },
      { status: 500 }
    );
  }
}

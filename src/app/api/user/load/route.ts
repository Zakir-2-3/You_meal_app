import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("email, cart, balance, promoCodes, avatar")
      .eq("email", email)
      .maybeSingle();

    if (!user) {
      // Если пользователя нет, то вернём пустые значения
      return NextResponse.json({
        email: null,
        cart: [],
        balance: 0,
        promoCodes: [],
        avatar: "",
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Ошибка в /api/user/load:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

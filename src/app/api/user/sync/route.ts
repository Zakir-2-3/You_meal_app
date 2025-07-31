import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "load") {
    const { data, error } = await supabase
      .from("users")
      .select("cart, promoCodes, balance, avatar")
      .eq("email", body.email)
      .single();

    if (error || !data) {
      console.warn(
        "Пользователь не найден или ошибка при загрузке:",
        error?.message
      );
      return NextResponse.json(
        { cart: [], promoCodes: [], balance: 0, avatar: null },
        { status: 200 }
      );
    }

    return NextResponse.json(data);
  }

  if (body.type === "save") {
    const { email, cart, promoCodes, balance, avatar } = body;

    const { error } = await supabase
      .from("users")
      .update({ cart, promoCodes, balance, avatar })
      .eq("email", email);

    if (error) {
      console.error("Ошибка сохранения данных:", error);
      return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Неверный тип запроса" }, { status: 400 });
}

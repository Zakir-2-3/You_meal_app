import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      cart,
      balance,
      promoCodes,
      avatar,
      city,
      ratings,
      favorites,
    } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {};

    // Основные данные
    if (Array.isArray(cart)) updateData.cart = cart;
    if (typeof balance === "number") updateData.balance = balance;
    if (promoCodes && typeof promoCodes === "object")
      updateData.promoCodes = promoCodes;
    if (typeof avatar === "string" && avatar.length > 0)
      updateData.avatar = avatar;
    if (typeof city === "string" && city.length > 0) updateData.city = city;

    // Метаданные продуктов
    if (ratings && typeof ratings === "object") {
      updateData.ratings = ratings;
    }
    if (Array.isArray(favorites)) {
      updateData.favorites = favorites;
    }

    // Проверка, есть ли что обновлять
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid data provided for update" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("email", email);

    if (error) {
      console.error("Ошибка обновления данных пользователя:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Ошибка сохранения:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

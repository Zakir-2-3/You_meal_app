import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { email, name, avatar } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Ищем пользователя
    const { data: user, error: selectError } = await supabase
      .from("users")
      .select("email, name, cart, balance, promoCodes, avatar, city")
      .eq("email", email)
      .maybeSingle();

    if (selectError) {
      console.error("Select error:", {
        message: selectError.message,
        code: selectError.code,
        details: selectError.details,
        hint: selectError.hint,
      });
      return NextResponse.json(
        {
          error: "DB error",
          details: selectError.message,
          code: selectError.code,
        },
        { status: 500 },
      );
    }

    // Создаем, если нет пользователя
    if (!user) {
      const newUser = {
        email,
        name: typeof name === "string" ? name : "",
        avatar: typeof avatar === "string" ? avatar : "",
        cart: [],
        balance: 0,
        promoCodes: {
          activated: [],
          customAvailable: [],
        },
        city: "",
      };

      const { error: insertError } = await supabase
        .from("users")
        .insert(newUser);

      if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json(
          { error: "Create user failed" },
          { status: 500 },
        );
      }

      return NextResponse.json(newUser);
    }

    // Если есть, то возвращаем
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error load:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

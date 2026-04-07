import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { email, ratings } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!ratings || Object.keys(ratings).length === 0) {
      return NextResponse.json(
        { error: "Ratings are required" },
        { status: 400 },
      );
    }

    // Получаем текущего пользователя
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("ratings")
      .eq("email", email)
      .single();

    if (findError && findError.code !== "PGRST116") {
      // PGRST116 = not found
      console.error("Fetch user error:", findError);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 },
      );
    }

    // Объединяем существующие рейтинги с новыми
    const mergedRatings = { ...(user?.ratings || {}), ...ratings };

    // Сохраняем в БД
    const { error: updateError } = await supabase
      .from("users")
      .update({ ratings: mergedRatings })
      .eq("email", email);

    if (updateError) {
      console.error("Update ratings error:", updateError);
      return NextResponse.json(
        { error: "Failed to update ratings" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, ratings: mergedRatings });
  } catch (error) {
    console.error("Sync ratings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

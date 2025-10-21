import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabaseClient";

import { DEFAULT_AVATAR } from "@/constants/defaults";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    console.log("Sync request for email:", email);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: userRow, error: findErr } = await supabase
      .from("users")
      .select("id, favorites, ratings, email, avatar")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (findErr) {
      console.error("fetch user error:", findErr);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    // Если нет строки, то создаём новую с пустыми данными
    if (!userRow) {
      console.log("Creating new user record for sync");
      const { error: insertErr } = await supabase.from("users").insert({
        email,
        favorites: [],
        ratings: {},
        avatar: DEFAULT_AVATAR,
      });

      if (insertErr) {
        console.error("insert user error:", insertErr);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        favorites: [],
        ratings: {},
        avatar: DEFAULT_AVATAR,
      });
    }

    // Если есть строка, то возвращаем то, что в базе (канон)
    const responseData = {
      favorites: Array.isArray(userRow.favorites) ? userRow.favorites : [],
      ratings:
        userRow.ratings && typeof userRow.ratings === "object"
          ? userRow.ratings
          : {},
      avatar: userRow.avatar || DEFAULT_AVATAR,
    };

    return NextResponse.json(responseData);
  } catch (e) {
    console.error("sync route error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/supabaseAdminClient";

export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Находим все аватарки пользователя
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from("avatars")
      .list("", {
        search: email,
      });

    if (listError) {
      console.error("Avatar list error:", listError.message);
      return NextResponse.json(
        { error: "Failed to list avatars" },
        { status: 500 },
      );
    }

    // Фильтруем только его файлы
    const userAvatars =
      files
        ?.filter((file) => file.name.startsWith(`${email}_`))
        .map((file) => file.name) || [];

    // Удаляем все его аватарки, если есть
    if (userAvatars.length > 0) {
      const { error: removeError } = await supabaseAdmin.storage
        .from("avatars")
        .remove(userAvatars);

      if (removeError) {
        console.error("Avatar remove error:", removeError.message);
        return NextResponse.json(
          { error: "Failed to remove avatars" },
          { status: 500 },
        );
      }
    }

    // Удаляем пользователя из users
    const { error: deleteUserError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("email", email);

    if (deleteUserError) {
      console.error("User delete error:", deleteUserError.message);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete account server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

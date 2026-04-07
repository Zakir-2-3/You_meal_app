import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase/supabaseClient";
import { checkPasswordMatch } from "@/lib/user/checkPasswordMatch";

export async function POST(req: Request) {
  try {
    const { email, newName, newPassword } = await req.json();

    const { data: user, error } = await supabase
      .from("users")
      .select("name")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const nameSame = newName ? newName === user.name : false;

    let passwordSame = false;
    if (newPassword) {
      try {
        passwordSame = await checkPasswordMatch(email, newPassword);
      } catch {
        return NextResponse.json(
          { message: "Error checking password" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ nameSame, passwordSame });
  } catch (err) {
    console.error("Data validation error:", err);
    return NextResponse.json(
      { message: "Data validation error" },
      { status: 500 },
    );
  }
}

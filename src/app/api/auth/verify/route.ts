import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, code, city } = body;

    if (!email || !code) {
      console.log("There is no email or code in the request");
      return NextResponse.json(
        { error: "Email and code required" },
        { status: 400 },
      );
    }

    const { data: record, error } = await supabase
      .from("VerificationCode")
      .select("*")
      .eq("email", email)
      .eq("purpose", "register")
      .single();

    if (error) {
      console.error("VerificationCode search error:", error.message);
    }

    if (!record) {
      console.log("No record found for this email");
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    if (record.code !== String(code)) {
      console.log("The code doesn't match", {
        codeFromDB: record.code,
        codeReceived: code,
      });
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      console.log("Code expired");
      return NextResponse.json(
        { error: "The code has expired" },
        { status: 400 },
      );
    }

    // Создаём пользователя
    const { error: insertError } = await supabase.from("users").insert({
      email: record.email,
      name: record.name,
      password: record.password,
      isVerified: true,
      balance: 0,
      cart: [],
      promoCodes: [],
      avatar: "",
      city: city || "",
    });

    if (insertError) {
      console.error("Error creating user:", insertError.message);
      return NextResponse.json(
        { error: "Error creating user" },
        { status: 500 },
      );
    }

    // Удаляем временную запись
    const { error: deleteError } = await supabase
      .from("VerificationCode")
      .delete()
      .eq("email", email);

    if (deleteError) {
      console.error("Error deleting VerificationCode:", deleteError.message);
    }

    return NextResponse.json({ message: "Email confirmed, account created" });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

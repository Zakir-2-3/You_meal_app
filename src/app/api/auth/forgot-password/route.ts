import { NextResponse } from "next/server";

import nodemailer from "nodemailer";

import { cleanupOldUsers } from "@/lib/user/cleanupOldUsers";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdminClient";
import { passwordRecoveryEmailTemplate } from "@/lib/emailTemplates/passwordRecoveryEmailTemplate";

export async function POST(req: Request) {
  try {
    // Удаляем старых пользователей (старше 1 месяца)
    await cleanupOldUsers();

    // Удаляем временные данные из VerificationCode, если им >2 часов
    await supabaseAdmin
      .from("VerificationCode")
      .delete()
      .lt("createdAt", new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

    const { email, lang = "ru" } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Проверка, есть ли подтверждённый пользователь
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, password")
      .eq("email", email)
      .maybeSingle();

    // Проверка, есть ли непотверждённый пользователь в VerificationCode
    const { data: pending } = await supabaseAdmin
      .from("VerificationCode")
      .select("email")
      .eq("email", email)
      .eq("purpose", "register")
      .maybeSingle();

    // Запрещаем сброс пароля, если это Google-аккаунт
    if (user && user.password === null) {
      return NextResponse.json(
        {
          error:
            lang === "ru"
              ? "Этот аккаунт использует вход через Google. Сброс пароля недоступен."
              : "This account uses Google Sign-in. Password reset is not available.",
        },
        { status: 403 },
      );
    }

    // Если пользователь не зарегистрирован, но находится в статусе "временной регистрации"
    if (!user && pending) {
      return NextResponse.json(
        {
          error:
            lang === "ru"
              ? "Почта ещё не подтверждена. Войдите для завершения регистрации."
              : "This email is not confirmed yet. Please complete registration.",
        },
        { status: 403 },
      );
    }

    // Если вообще нет такого email
    if (!user) {
      return NextResponse.json(
        {
          error:
            lang === "ru"
              ? "Пользователь с таким email не найден"
              : "User with this email not found",
        },
        { status: 404 },
      );
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const now = new Date();

    const { data: existingCode, error: findError } = await supabaseAdmin
      .from("VerificationCode")
      .select("*")
      .eq("email", email)
      .eq("purpose", "recovery")
      .maybeSingle();

    if (findError) {
      console.error("VerificationCode lookup error:", findError.message);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const updateData: any = {
      code: verificationCode,
      expires_at,
      attempts: (existingCode?.attempts || 0) + 1,
      name: null,
      password: null,
    };

    if (
      existingCode?.blockedUntil &&
      new Date(existingCode.blockedUntil) > now
    ) {
      return NextResponse.json(
        {
          message:
            lang === "ru"
              ? "Слишком много попыток. Код уже был отправлен ранее."
              : "Too many attempts. The code has already been sent earlier.",
          blockedUntil: existingCode.blockedUntil,
        },
        { status: 429 },
      );
    }

    if (updateData.attempts >= 2) {
      updateData.blockedUntil = new Date(
        now.getTime() + 2 * 60 * 60 * 1000,
      ).toISOString();
    }

    if (existingCode) {
      const { error: updateError } = await supabaseAdmin
        .from("VerificationCode")
        .update(updateData)
        .eq("email", email)
        .eq("purpose", "recovery");

      if (updateError) {
        console.error("Error updating VerificationCode:", updateError.message);
        return NextResponse.json({ error: "Error updating" }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from("VerificationCode")
        .insert({
          email,
          code: verificationCode,
          expires_at,
          attempts: 1,
          purpose: "recovery",
        });

      if (insertError) {
        console.error("Error inserting VerificationCode:", insertError.message);
        return NextResponse.json({ error: "Insertion error" }, { status: 500 });
      }
    }

    // Отправляем письмо с учётом языка
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        minVersion: "TLSv1.2",
      },
      family: 4,
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

    const subject =
      lang === "ru" ? "Восстановление пароля" : "Password Recovery";

    await transporter.sendMail({
      from: `"YourMeal" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html: passwordRecoveryEmailTemplate(verificationCode, lang),
    });

    return NextResponse.json({
      message:
        lang === "ru"
          ? "Код восстановления отправлен на почту"
          : "Password recovery code has been sent to your email",
      blockedUntil: updateData.blockedUntil || null,
    });
  } catch (error: any) {
    console.error("Password recovery error:", error.message || error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

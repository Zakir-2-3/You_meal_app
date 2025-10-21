import { NextResponse } from "next/server";

import nodemailer from "nodemailer";

import { supabase } from "@/lib/supabaseClient";
import { cleanupOldUsers } from "@/lib/cleanupOldUsers";
import { passwordRecoveryEmailTemplate } from "@/lib/emailTemplates/passwordRecoveryEmailTemplate";

export async function POST(req: Request) {
  try {
    // Удаляем старых пользователей (старше 1 месяца)
    await cleanupOldUsers();

    const { email, lang = "ru" } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    // Проверка, есть ли подтверждённый пользователь
    const { data: user } = await supabase
      .from("users")
      .select("id, password")
      .eq("email", email)
      .maybeSingle();

    // Проверка, есть ли непотверждённый пользователь в VerificationCode
    const { data: pending } = await supabase
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
              : "This account uses Google login. Password reset is not available.",
        },
        { status: 403 }
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
        { status: 403 }
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
        { status: 404 }
      );
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const now = new Date();

    const { data: existingCode, error: findError } = await supabase
      .from("VerificationCode")
      .select("*")
      .eq("email", email)
      .eq("purpose", "recovery")
      .maybeSingle();

    if (findError) {
      console.error("Ошибка поиска VerificationCode:", findError.message);
      return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
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
        { status: 429 }
      );
    }

    if (updateData.attempts >= 2) {
      updateData.blockedUntil = new Date(
        now.getTime() + 2 * 60 * 60 * 1000
      ).toISOString();
    }

    if (existingCode) {
      const { error: updateError } = await supabase
        .from("VerificationCode")
        .update(updateData)
        .eq("email", email)
        .eq("purpose", "recovery");

      if (updateError) {
        console.error(
          "Ошибка обновления VerificationCode:",
          updateError.message
        );
        return NextResponse.json(
          { error: "Ошибка обновления" },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from("VerificationCode")
        .insert({
          email,
          code: verificationCode,
          expires_at,
          attempts: 1,
          purpose: "recovery",
        });

      if (insertError) {
        console.error("Ошибка вставки VerificationCode:", insertError.message);
        return NextResponse.json({ error: "Ошибка вставки" }, { status: 500 });
      }
    }

    // Отправляем письмо с учётом языка
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
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
    console.error("Ошибка восстановления пароля:", error.message || error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

import { supabase } from "@/lib/supabaseClient";
import { cleanupOldUsers } from "@/lib/cleanupOldUsers";
import { verificationEmailTemplate } from "@/lib/emailTemplates/verificationEmailTemplate";

// Отправка письма
async function sendVerificationEmail(
  code: string,
  email: string,
  lang: "ru" | "en" = "ru",
  isResend = false
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Выбираем тему письма в зависимости от языка
  const subject = isResend
    ? lang === "ru"
      ? "Повторное подтверждение регистрации"
      : "Resend registration confirmation"
    : lang === "ru"
    ? "Код подтверждения регистрации"
    : "Registration verification code";

  const html = verificationEmailTemplate(code, lang);

  await transporter.sendMail({
    from: `"YourMeal" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });
}

export async function POST(req: Request) {
  try {
    await cleanupOldUsers();

    await supabase
      .from("VerificationCode")
      .delete()
      .lt("createdAt", new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

    const body = await req.json();

    const { email, name, password, isResend, lang = "ru" } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
    }

    // Проверка существующего пользователя
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id, password")
      .eq("email", email)
      .maybeSingle();

    if (userCheckError) {
      console.error(
        "Ошибка проверки существующего пользователя:",
        userCheckError.message
      );
      return NextResponse.json(
        { error: "Ошибка проверки пользователя" },
        { status: 500 }
      );
    }

    if (existingUser && !existingUser.password) {
      return NextResponse.json(
        { error: "Этот email уже привязан к Google-аккаунту" },
        { status: 403 }
      );
    }

    const now = new Date();
    const expires_at = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: existingCodeRow } = await supabase
      .from("VerificationCode")
      .select("*")
      .eq("email", email)
      .eq("purpose", "register")
      .single();

    const existingCode = existingCodeRow || null;

    // Повторная отправка кода
    if (isResend) {
      if (!existingCode) {
        return NextResponse.json(
          { error: "Не найдена регистрация для повторной отправки" },
          { status: 404 }
        );
      }

      const attempts = existingCode.attempts || 0;

      if (attempts >= 2) {
        return NextResponse.json(
          {
            message:
              lang === "ru"
                ? "Слишком много попыток. Повторная отправка недоступна."
                : "Too many attempts. Resending is unavailable.",
            blockedUntil: existingCode.blockedUntil || null,
          },
          { status: 429 }
        );
      }

      const newCode = Math.floor(100000 + Math.random() * 900000).toString();

      const { error: updateError, data: updatedData } = await supabase
        .from("VerificationCode")
        .update({
          code: newCode,
          expires_at,
          attempts: attempts + 1,
          blockedUntil:
            attempts + 1 >= 2
              ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
              : null,
        })
        .eq("email", email)
        .eq("purpose", "register")
        .select("*");

      if (updateError) {
        console.error("Ошибка при обновлении VerificationCode:", updateError);
        return NextResponse.json(
          { error: "Ошибка при повторной отправке кода" },
          { status: 500 }
        );
      }

      await sendVerificationEmail(newCode, email, lang, true);

      return NextResponse.json(
        {
          message:
            lang === "ru"
              ? "Код повторно отправлен"
              : "Verification code resent",
          blockedUntil: updatedData?.[0]?.blockedUntil || null,
        },
        { status: 200 }
      );
    }

    // Если код уже есть и активен
    if (existingCode && new Date(existingCode.expires_at) > now) {
      return NextResponse.json(
        {
          message:
            lang === "ru"
              ? "Код уже был отправлен. Введите его или запросите повторно."
              : "The code has already been sent. Please enter it or request again.",
          blockedUntil: existingCode.blockedUntil || null,
        },
        { status: 208 }
      );
    }

    // Первая регистрация
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const { error: insertError } = await supabase
      .from("VerificationCode")
      .insert([
        {
          email,
          name,
          password: hashedPassword,
          code,
          expires_at,
          purpose: "register",
          attempts: 0,
        },
      ]);

    if (insertError) {
      console.error("Ошибка создания записи:", insertError.message);
      return NextResponse.json(
        { error: "Ошибка создания записи" },
        { status: 500 }
      );
    }

    // Отправляем письмо с учётом языка
    await sendVerificationEmail(code, email, lang);

    return NextResponse.json(
      {
        message:
          lang === "ru"
            ? "Код отправлен на почту"
            : "Verification code sent to your email",
        blockedUntil: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

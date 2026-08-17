import { NextResponse } from "next/server";

import nodemailer from "nodemailer";

import bcrypt from "bcryptjs";

import { cleanupOldUsers } from "@/lib/user/cleanupOldUsers";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdminClient";
import { verificationEmailTemplate } from "@/lib/emailTemplates/verificationEmailTemplate";

import {
  checkResendBlock,
  generateVerificationCode,
  localizedResponse,
  upsertVerificationCode,
} from "@/utils/auth/verificationHelpers";

// Отправка письма
async function sendVerificationEmail(
  code: string,
  email: string,
  lang: "ru" | "en" = "ru",
  isResend = false,
) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { minVersion: "TLSv1.2" },
    family: 4,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  // Проверка SMTP-Сервера
  try {
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("SMTP_VERIFY_TIMEOUT")), 5000),
      ),
    ]);
  } catch (verifyError) {
    console.error("SMTP verify failed:", verifyError);
    throw new Error("SMTP_UNAVAILABLE");
  }

  // Сервер доступен – отправляем письмо
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

    await supabaseAdmin
      .from("VerificationCode")
      .delete()
      .lt("createdAt", new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

    const body = await req.json();
    const { email, name, password, isResend, lang = "ru" } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Incorrect data" }, { status: 400 });
    }

    // Проверка существующего пользователя
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from("users")
      .select("id, password")
      .eq("email", email)
      .maybeSingle();

    if (userCheckError) {
      console.error("Error checking existing user:", userCheckError.message);
      return NextResponse.json({ error: "USER_CHECK_ERROR" }, { status: 500 });
    }

    if (existingUser && !existingUser.password) {
      return localizedResponse(
        lang,
        "Этот email уже привязан к Google-аккаунту.",
        "This email is already linked to a Google account.",
        403,
      );
    }

    if (existingUser && existingUser.password) {
      return localizedResponse(
        lang,
        "Пользователь с таким email уже зарегистрирован. Войдите.",
        "User with this email already registered. Please sign in.",
        409,
      );
    }

    const now = new Date();
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: existingCodeRow } = await supabaseAdmin
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
          { error: "No registration found for resubmission" },
          { status: 404 },
        );
      }

      const blockResult = checkResendBlock(existingCode, now);
      if (blockResult.error) {
        return localizedResponse(
          lang,
          blockResult.error.messageRu,
          blockResult.error.messageEn,
          blockResult.error.status,
          { blockedUntil: existingCode.blockedUntil },
        );
      }

      const effectiveAttempts = blockResult.effectiveAttempts;
      const { code: newCode, expires_at } = generateVerificationCode(now);

      const { error: updateError, data: updatedData } =
        await upsertVerificationCode(
          supabaseAdmin,
          email,
          "register",
          {
            code: newCode,
            expires_at,
            attempts: effectiveAttempts + 1,
            blockedUntil:
              effectiveAttempts + 1 >= 3
                ? new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString()
                : null,
          },
          true,
        );

      if (updateError) {
        console.error("Error updating VerificationCode:", updateError);
        return NextResponse.json({ error: "RESEND_ERROR" }, { status: 500 });
      }

      await sendVerificationEmail(newCode, email, lang, true);

      return localizedResponse(
        lang,
        "Код повторно отправлен",
        "Verification code resent",
        200,
        {
          blockedUntil: updatedData?.[0]?.blockedUntil || null,
          attempts: effectiveAttempts + 1,
        },
      );
    }

    // Код уже есть и активен
    if (existingCode && new Date(existingCode.expires_at) > now) {
      return localizedResponse(
        lang,
        "Код уже был отправлен. Введите его или запросите повторно.",
        "The code has already been sent. Please enter it or request again.",
        208,
        { blockedUntil: existingCode.blockedUntil || null },
      );
    }

    // Код истёк
    if (existingCode && new Date(existingCode.expires_at) <= now) {
      const blockResult = checkResendBlock(existingCode, now);
      if (blockResult.error) {
        return localizedResponse(
          lang,
          blockResult.error.messageRu,
          blockResult.error.messageEn,
          blockResult.error.status,
          { blockedUntil: existingCode.blockedUntil },
        );
      }

      const effectiveAttempts = blockResult.effectiveAttempts;
      const { code: newCode, expires_at: newExpiresAt } =
        generateVerificationCode(now);

      const { error: updateError } = await upsertVerificationCode(
        supabaseAdmin,
        email,
        "register",
        {
          code: newCode,
          expires_at: newExpiresAt,
          attempts: effectiveAttempts + 1,
          blockedUntil:
            effectiveAttempts + 1 >= 3
              ? new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString()
              : null,
        },
        true,
      );

      if (updateError) {
        console.error("Error updating expired code:", updateError);
        return NextResponse.json(
          { error: "VERIFICATION_UPDATE_ERROR" },
          { status: 500 },
        );
      }

      await sendVerificationEmail(newCode, email, lang);

      return localizedResponse(
        lang,
        "Код отправлен на почту",
        "Verification code sent to your email",
        200,
        {
          blockedUntil:
            effectiveAttempts + 1 >= 3
              ? new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString()
              : null,
          attempts: effectiveAttempts + 1,
        },
      );
    }

    // Первая регистрация (нет existingCode)
    const { code, expires_at } = generateVerificationCode(now);

    // 1. Сначала пытаемся отправить письмо (без предварительного сохранения)
    try {
      await sendVerificationEmail(code, email, lang);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Письмо не ушло – ничего не сохраняем
      return NextResponse.json({ error: "EMAIL_SEND_FAILED" }, { status: 500 });
    }

    // 2. Письмо успешно отправлено – теперь сохраняем код
    const { error: upsertError } = await upsertVerificationCode(
      supabaseAdmin,
      email,
      "register",
      {
        name,
        password: hashedPassword,
        code,
        expires_at,
        attempts: 1,
      },
      false,
    );

    if (upsertError) {
      console.error("Error upserting record:", upsertError.message);
      return NextResponse.json(
        { error: "VERIFICATION_INSERT_ERROR" },
        { status: 500 },
      );
    }

    return localizedResponse(
      lang,
      "Код отправлен на почту",
      "Verification code sent to your email",
      200,
      { blockedUntil: null },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

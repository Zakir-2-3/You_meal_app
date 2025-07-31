import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import nodemailer from "nodemailer";
import { verificationEmailTemplate } from "@/lib/emailTemplates/verificationEmailTemplate";
import { cleanupOldUsers } from "@/lib/cleanupOldUsers";
import bcrypt from "bcryptjs";

// Отправка письма
async function sendVerificationEmail(
  code: string,
  email: string,
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

  await transporter.sendMail({
    from: `"YourMeal" <${process.env.SMTP_USER}>`,
    to: email,
    subject: isResend
      ? "Повторное подтверждение регистрации"
      : "Код подтверждения регистрации",
    html: verificationEmailTemplate(code),
  });
}

export async function POST(req: Request) {
  try {
    // Удаляем старых пользователей (старше 1 месяца)
    await cleanupOldUsers();

    // Удаляем все устаревшие записи (старше 2 часов)
    await supabase
      .from("VerificationCode")
      .delete()
      .lt("createdAt", new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

    const body = await req.json();
    const { email, name, password, isResend } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
    }

    // Проверка, существует ли подтверждённый пользователь с таким email
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
        {
          error: "Этот email уже привязан к Google-аккаунту",
        },
        { status: 403 }
      );
    }

    const now = new Date();
    const expires_at = new Date(now.getTime() + 10 * 60 * 1000).toISOString(); // 10 минут
    const hashedPassword = await bcrypt.hash(password, 10);

    // Получаем текущую временную запись
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
            message: "Слишком много попыток. Повторная отправка недоступна.",
            blockedUntil: existingCode.blockedUntil || null,
          },
          { status: 429 }
        );
      }

      const newCode = Math.floor(100000 + Math.random() * 900000).toString();

      const updateResponse = await supabase
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

      const { error: updateError, data: updatedData } = updateResponse;

      if (updateError) {
        console.error("Ошибка при обновлении VerificationCode:", updateError);
        return NextResponse.json(
          { error: "Ошибка при повторной отправке кода" },
          { status: 500 }
        );
      }

      await sendVerificationEmail(newCode, email, true);

      return NextResponse.json(
        {
          message: "Код повторно отправлен",
          blockedUntil: updatedData?.[0]?.blockedUntil || null,
        },
        { status: 200 }
      );
    }

    // Если код еще актуален
    if (existingCode && new Date(existingCode.expires_at) > now) {
      return NextResponse.json(
        {
          message: "Код уже был отправлен. Введите его или запросите повторно.",
          blockedUntil: existingCode.blockedUntil || null,
        },
        { status: 208 }
      );
    }

    // Обновляем истекший код, но запись есть
    if (existingCode) {
      const attempts = existingCode.attempts || 0;
      if (attempts >= 2) {
        return NextResponse.json(
          {
            error: "Слишком много попыток. Регистрация заблокирована.",
            blockedUntil: existingCode.blockedUntil || null,
          },
          { status: 429 }
        );
      }

      const newCode = Math.floor(100000 + Math.random() * 900000).toString();

      const updateData: any = {
        code: newCode,
        expires_at,
        name,
        password: hashedPassword,
        attempts: attempts + 1,
        blockedUntil: null,
      };

      if (updateData.attempts >= 2) {
        updateData.blockedUntil = new Date(
          Date.now() + 2 * 60 * 60 * 1000
        ).toISOString();
      }

      const { error: updateError } = await supabase
        .from("VerificationCode")
        .update(updateData)
        .eq("email", email)
        .eq("purpose", "register");

      if (updateError) {
        console.error("Ошибка обновления записи:", updateError.message);
        return NextResponse.json(
          { error: "Ошибка обновления записи" },
          { status: 500 }
        );
      }

      await sendVerificationEmail(newCode, email);
      return NextResponse.json(
        {
          message: "Новый код отправлен",
          blockedUntil: updateData.blockedUntil || null,
        },
        { status: 200 }
      );
    }

    // Первая регистрация, создаём новую запись
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

    await sendVerificationEmail(code, email);

    return NextResponse.json(
      {
        message: "Код отправлен на почту",
        blockedUntil: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

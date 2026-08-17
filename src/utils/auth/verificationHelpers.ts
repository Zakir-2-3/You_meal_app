import { NextResponse } from "next/server";

// Проверяет блокировку и возвращает эффективное количество попыток.
export function checkResendBlock(
  existingCode: {
    attempts?: number;
    blockedUntil?: string | null;
  },
  now: Date,
  maxAttempts = 3,
):
  | {
      error: { status: number; messageRu: string; messageEn: string };
      effectiveAttempts?: undefined;
    }
  | { error?: undefined; effectiveAttempts: number } {
  const attempts = existingCode.attempts ?? 0;
  const blockedUntil = existingCode.blockedUntil
    ? new Date(existingCode.blockedUntil)
    : null;
  const isBlocked = blockedUntil && blockedUntil > now;

  if (isBlocked) {
    return {
      error: {
        status: 429,
        messageRu: "Слишком много попыток. Попробуйте позже.",
        messageEn: "Too many attempts. Try again later.",
      },
    };
  }

  const effectiveAttempts =
    blockedUntil && blockedUntil <= now ? Math.max(0, attempts - 1) : attempts;

  if (effectiveAttempts >= maxAttempts) {
    return {
      error: {
        status: 429,
        messageRu: "Слишком много попыток. Повторная отправка недоступна.",
        messageEn: "Too many attempts. Resending is unavailable.",
      },
    };
  }

  return { effectiveAttempts };
}

// Генерирует 6-значный код и дату истечения (10 минут).
export function generateVerificationCode(now: Date) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
  return { code, expires_at };
}

// Упрощает локализованный JSON-ответ.
export function localizedResponse(
  lang: "ru" | "en",
  ruText: string,
  enText: string,
  status: number,
  extraFields?: Record<string, any>,
) {
  return NextResponse.json(
    { message: lang === "ru" ? ruText : enText, ...extraFields },
    { status },
  );
}

// Обновляет или вставляет запись в VerificationCode, возвращает ошибку и (при update) обновлённые данные.
export async function upsertVerificationCode(
  supabaseAdmin: any,
  email: string,
  purpose: "register" | "recovery",
  data: Record<string, any>,
  isUpdate: boolean,
) {
  if (isUpdate) {
    const { error, data: updatedData } = await supabaseAdmin
      .from("VerificationCode")
      .update(data)
      .eq("email", email)
      .eq("purpose", purpose)
      .select("*");
    return { error, data: updatedData };
  }
  const { error } = await supabaseAdmin
    .from("VerificationCode")
    .upsert([{ email, purpose, ...data }], { onConflict: "email" });
  return { error, data: null };
}

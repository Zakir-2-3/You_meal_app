import bcrypt from "bcryptjs";

import { supabase } from "@/lib/supabaseClient";

export async function checkPasswordMatch(
  email: string,
  newPassword: string
): Promise<boolean> {
  const { data: userData, error } = await supabase
    .from("users")
    .select("password")
    .eq("email", email)
    .single();

  if (error || !userData?.password) {
    throw new Error("Пользователь не найден или ошибка получения пароля");
  }

  return await bcrypt.compare(newPassword, userData.password);
}

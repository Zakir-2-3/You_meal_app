import { supabaseAdmin } from "../supabase/supabaseAdminClient";

export async function deleteUserWithAssets(email: string) {
  // Найти все аватарки пользователя
  const { data: files, error: listError } = await supabaseAdmin.storage
    .from("avatars")
    .list("", {
      search: email,
    });

  if (listError) {
    throw new Error(`Avatar list error: ${listError.message}`);
  }

  const userAvatars =
    files
      ?.filter((file) => file.name.startsWith(`${email}_`))
      .map((file) => file.name) || [];

  // Удалить все его аватарки
  if (userAvatars.length > 0) {
    const { error: removeError } = await supabaseAdmin.storage
      .from("avatars")
      .remove(userAvatars);

    if (removeError) {
      throw new Error(`Avatar remove error: ${removeError.message}`);
    }
  }

  // Удалить пользователя
  const { error: deleteUserError } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("email", email);

  if (deleteUserError) {
    throw new Error(`User delete error: ${deleteUserError.message}`);
  }
}

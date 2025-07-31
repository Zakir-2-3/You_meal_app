import { supabaseAdmin } from "./supabaseAdminClient";

export async function cleanupOldUsers() {
  const cutoffDate = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: oldUsers, error: fetchError } = await supabaseAdmin
    .from("users")
    .select("id, email, avatar")
    .lt("createdAt", cutoffDate);

  if (fetchError) {
    console.error("Ошибка получения старых пользователей:", fetchError.message);
    return;
  }

  if (!oldUsers || oldUsers.length === 0) return;

  for (const user of oldUsers) {
    if (user.avatar && user.avatar.includes("/avatars/")) {
      const fileName = user.avatar.split("/avatars/")[1];

      if (fileName) {
        const { error: removeError } = await supabaseAdmin.storage
          .from("avatars")
          .remove([fileName]);

        if (removeError) {
          console.warn(
            `Не удалось удалить аватарку для ${user.email}:`,
            removeError.message
          );
        } else {
          console.log(`Аватарка удалена: ${fileName}`);
        }
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", user.id);

    if (deleteError) {
      console.warn(
        `Не удалось удалить пользователя ${user.email}:`,
        deleteError.message
      );
    } else {
      console.log(`Пользователь удалён: ${user.email}`);
    }
  }
}

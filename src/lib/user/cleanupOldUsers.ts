import { supabaseAdmin } from "../supabase/supabaseAdminClient";
import { deleteUserWithAssets } from "./deleteUserWithAssets";

export async function cleanupOldUsers() {
  const cutoffDate = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: oldUsers, error: fetchError } = await supabaseAdmin
    .from("users")
    .select("email")
    .lt("createdAt", cutoffDate);

  if (fetchError) {
    console.error("Error getting old users:", fetchError.message);
    return;
  }

  if (!oldUsers || oldUsers.length === 0) {
    console.log("Cleanup: no old users found");
    return;
  }

  for (const user of oldUsers) {
    try {
      await deleteUserWithAssets(user.email);
      console.log(`Cleanup success: ${user.email}`);
    } catch (err) {
      console.error(
        `Cleanup failed for ${user.email}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}

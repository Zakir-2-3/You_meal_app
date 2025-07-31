import { supabase } from "@/lib/supabaseClient";

export const syncUserData = async ({
  type,
  email,
  userId,
  name,
  image,
  cart,
  promoCodes,
  balance,
}: {
  type: "save" | "load";
  email?: string;
  userId?: string;
  name?: string;
  image?: string;
  cart?: any[];
  promoCodes?: {
    activated: string[];
    available: string[];
  };
  balance?: number;
}) => {
  const identifier = email || userId;
  if (!identifier) return null;

  if (type === "save") {
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq(email ? "email" : "id", identifier)
      .maybeSingle();

    if (findError) {
      console.error("Ошибка поиска пользователя", findError);
      return { error: true };
    }

    if (existingUser) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          cart,
          balance,
          promoCodes: {
            activated: promoCodes?.activated ?? [],
            available: promoCodes?.available ?? [],
          },
          ...(name && { name }),
          ...(image && { image }),
        })
        .eq("id", existingUser.id);

      if (updateError) {
        console.error("Ошибка обновления пользователя", updateError);
        return { error: true };
      }
    } else {
      const { error: insertError } = await supabase.from("users").insert({
        email,
        id: userId,
        name: name || "",
        image: image || "",
        cart: cart || [],
        promoCodes: promoCodes || [],
        balance: balance || 0,
      });

      if (insertError) {
        console.error("Ошибка создания пользователя", insertError);
        return { error: true };
      }
    }

    return { success: true };
  }

  if (type === "load") {
    const { data: existingUser, error } = await supabase
      .from("users")
      .select("*")
      .eq(email ? "email" : "id", identifier)
      .maybeSingle();

    if (error) {
      console.error("Ошибка загрузки пользователя", error);
      return null;
    }
    return {
      cart: existingUser?.cart ?? [],
      promoCodes: {
        activated: existingUser?.promoCodes?.activated ?? [],
        available: existingUser?.promoCodes?.available ?? [],
      },
      balance: existingUser?.balance ?? 0,
      name: existingUser?.name ?? name ?? "",
      image: existingUser?.image ?? image ?? "",
    };
  }

  return null;
};

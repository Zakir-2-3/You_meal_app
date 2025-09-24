import { supabase } from "@/lib/supabaseClient";

export const syncUserData = async ({
  type,
  email,
  userId,
  name,
  avatar,
  cart,
  promoCodes,
  balance,
  favorites,
  ratings,
  city,
}: {
  type: "save" | "load";
  email?: string;
  userId?: string;
  name?: string;
  avatar?: string;
  cart?: any[];
  promoCodes?: { activated: string[]; available: string[] };
  balance?: number;
  favorites?: string[];
  ratings?: Record<string, number>;
  city?: string;
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

    // Собираем только те поля, которые пришли
    const updatePayload: Record<string, any> = {};
    if (typeof name === "string") updatePayload.name = name;
    if (typeof avatar === "string") updatePayload.image = avatar;
    if (Array.isArray(cart)) updatePayload.cart = cart;
    if (typeof balance === "number") updatePayload.balance = balance;
    if (promoCodes && typeof promoCodes === "object")
      updatePayload.promoCodes = promoCodes;
    if (Array.isArray(favorites)) updatePayload.favorites = favorites;
    if (ratings && typeof ratings === "object") updatePayload.ratings = ratings;
    if (typeof city === "string" && city.length > 0) updatePayload.city = city;

    if (existingUser) {
      if (Object.keys(updatePayload).length === 0) {
        return { success: true }; // если нечего обновлять, то ок
      }

      const { error: updateError } = await supabase
        .from("users")
        .update(updatePayload)
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
        avatar: avatar || "",
        cart: cart || [],
        promoCodes: promoCodes || { activated: [], available: [] },
        balance: typeof balance === "number" ? balance : 0,
        favorites: Array.isArray(favorites) ? favorites : [],
        ratings: ratings && typeof ratings === "object" ? ratings : {},
        city: city || "",
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
      favorites: existingUser?.favorites ?? [],
      ratings: existingUser?.ratings ?? {},
      name: existingUser?.name ?? name ?? "",
      image: existingUser?.avatar ?? avatar ?? "",
      city: existingUser?.city ?? city ?? "",
    };
  }

  return null;
};

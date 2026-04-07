import { supabase } from "@/lib/supabase/supabaseClient";

import { SyncUserDataParams } from "@/types/user/sync";

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
}: SyncUserDataParams) => {
  const identifier = email || userId;
  if (!identifier) return null;

  if (type === "save") {
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq(email ? "email" : "id", identifier)
      .maybeSingle();

    if (findError) {
      console.error("User search error", findError);
      return { error: true };
    }

    // Собираем только те поля, которые пришли
    const updatePayload: Record<string, any> = {};
    if (typeof name === "string") updatePayload.name = name;
    if (typeof avatar === "string") updatePayload.avatar = avatar;
    if (Array.isArray(cart)) updatePayload.cart = cart;
    if (typeof balance === "number") updatePayload.balance = balance;
    if (
      promoCodes &&
      typeof promoCodes === "object" &&
      (promoCodes.activated.length > 0 || promoCodes.customAvailable.length > 0)
    ) {
      updatePayload.promoCodes = {
        activated: promoCodes.activated,
        customAvailable: promoCodes.customAvailable,
      };
    }

    if (Array.isArray(favorites)) updatePayload.favorites = favorites;
    if (ratings && typeof ratings === "object") updatePayload.ratings = ratings;
    if (typeof city === "string" && city.length > 0) updatePayload.city = city;

    if (existingUser) {
      if (Object.keys(updatePayload).length === 0) {
        return { success: true };
      }

      const { error: updateError } = await supabase
        .from("users")
        .update(updatePayload)
        .eq("id", existingUser.id);

      if (updateError) {
        console.error("User update error", updateError);
        return { error: true };
      }
    } else {
      const { error: insertError } = await supabase.from("users").insert({
        email,
        id: userId,
        name: name || "",
        avatar: avatar || "",
        cart: cart || [],
        promoCodes: {
          activated: promoCodes?.activated ?? [],
          customAvailable: promoCodes?.customAvailable ?? [],
        },

        balance: typeof balance === "number" ? balance : 0,
        favorites: Array.isArray(favorites) ? favorites : [],
        ratings: ratings && typeof ratings === "object" ? ratings : {},
        city: city || "",
      });

      if (insertError) {
        console.error("Error creating user", insertError);
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
      console.error("User Load Error", error);
      return null;
    }

    return {
      cart: existingUser?.cart ?? [],
      promoCodes: {
        activated: Array.isArray(existingUser?.promoCodes?.activated)
          ? existingUser.promoCodes.activated
          : [],
        customAvailable: Array.isArray(
          existingUser?.promoCodes?.customAvailable,
        )
          ? existingUser.promoCodes.customAvailable
          : [],
      },

      balance: existingUser?.balance ?? 0,
      favorites: existingUser?.favorites ?? [],
      ratings: existingUser?.ratings ?? {},
      name: existingUser?.name ?? name ?? "",
      avatar: existingUser?.avatar ?? avatar ?? "",
      city: existingUser?.city ?? city ?? "",
    };
  }

  return null;
};

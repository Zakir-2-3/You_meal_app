import { AppThunk } from "@/store/store";
import { persistor } from "@/store/store";
import { hydrateMeta, setMetaSynced } from "@/store/slices/productMetaSlice";

export const syncUserMetaIfAuth = (): AppThunk<
  Promise<{ favorites: string[]; ratings: Record<string, number> } | null>
> => {
  return async (dispatch, getState) => {
    const { isAuth, email } = getState().user;
    const {
      metaSynced,
      ratings: localRatings,
      favorites: localFavorites,
    } = getState().productMeta;

    if (!isAuth || !email) return null;

    if (metaSynced) {
      return null;
    }

    try {
      // Загружаем данные с сервера
      const res = await fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Sync failed: ${res.status} ${errorText}`);
      }

      const payload = await res.json();

      const serverFavorites: string[] = Array.isArray(payload.favorites)
        ? payload.favorites
        : [];
      const serverRatings: Record<string, number> =
        payload.ratings && typeof payload.ratings === "object"
          ? payload.ratings
          : {};

      // Логика приоритета данных
      let finalFavorites = serverFavorites;
      let finalRatings = serverRatings;
      let source = "server";

      // Если на сервере нет данных (новый аккаунт) - используем локальные данные
      if (
        serverFavorites.length === 0 &&
        Object.keys(serverRatings).length === 0
      ) {
        console.log("Серверные данные пустые, используем локальные данные");
        finalFavorites = localFavorites;
        finalRatings = localRatings;
        source = "local";
      }
      // Серверные данные рейтингов в приоритете
      else if (Object.keys(serverRatings).length > 0) {
        finalRatings = serverRatings;
        // Если серверные данные избранных пустые, то используем локальные
        finalFavorites =
          serverFavorites.length > 0 ? serverFavorites : localFavorites;
        source = "server-ratings-priority";
      }
      // Если серверные данные избранных пустые, то используем локальные
      else if (serverFavorites.length === 0 && localFavorites.length > 0) {
        finalFavorites = localFavorites;
        finalRatings = localRatings;
        source = "local-favorites";
      }
      // По умолчанию используем серверные данные
      else {
        finalFavorites = serverFavorites;
        finalRatings = serverRatings;
        source = "server-default";
      }

      // Сохраняем выбранные данные на сервер, если использовали локальные
      if (source === "local" || source === "local-favorites") {
        await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            favorites: finalFavorites,
            ratings: finalRatings,
          }),
        });
      }

      // Применяем выбранные данные
      dispatch(
        hydrateMeta({
          favorites: finalFavorites,
          ratings: finalRatings,
        })
      );

      // Немедленно записываем обновленное состояние в persist storage
      try {
        await persistor.flush();
        console.log(
          "Метаданные сохранены в persist storage, источник:",
          source
        );
      } catch (e) {
        console.error("Ошибка при сохранении в persist:", e);
        throw e;
      }

      return { favorites: finalFavorites, ratings: finalRatings };
    } catch (error) {
      console.error("Sync failed:", error);

      // При ошибке используем локальные данные
      dispatch(setMetaSynced(true));

      try {
        await persistor.flush();
      } catch (flushError) {
        console.error("Ошибка при сохранении в persist storage:", flushError);
      }

      return null;
    }
  };
};

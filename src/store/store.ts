import { useSelector, TypedUseSelectorHook } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

import storage from "redux-persist/lib/storage";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import categoryReducer from "./slices/categorySlice";
import cartReducer from "./slices/cartSlice";
import userReducer from "./slices/userSlice";
import promoReducer from "./slices/promoSlice";

import { autoSaveMiddleware } from "./middleware/autoSaveMiddleware";

const rootReducer = combineReducers({
  category: categoryReducer,
  cart: cartReducer,
  user: userReducer,
  promo: promoReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "cart", "promo"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(autoSaveMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

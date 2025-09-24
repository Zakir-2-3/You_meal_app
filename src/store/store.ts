import { useSelector, useDispatch, TypedUseSelectorHook } from "react-redux";
import {
  combineReducers,
  configureStore,
  ThunkAction,
  UnknownAction,
} from "@reduxjs/toolkit";
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
import productMetaReducer from "./slices/productMetaSlice";

import { autoSaveMiddleware } from "./middleware/autoSaveMiddleware";

const rootReducer = combineReducers({
  cart: cartReducer,
  user: userReducer,
  promo: promoReducer,
  category: categoryReducer,
  productMeta: productMetaReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "cart", "promo", "productMeta"],
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

// Тип для Thunk-действий (с использованием UnknownAction вместо AnyAction)
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Корректное расширение для Dispatch (без дублирования type parameters)
declare module "redux" {
  interface Dispatch {
    <ReturnType = void>(asyncAction: AppThunk<ReturnType>): ReturnType;
  }
}

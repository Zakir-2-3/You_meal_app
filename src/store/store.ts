import { useSelector, useDispatch, TypedUseSelectorHook } from "react-redux";
import storage from "redux-persist/lib/storage";
import {
  combineReducers,
  configureStore,
  ThunkAction,
  UnknownAction,
} from "@reduxjs/toolkit";
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

import cartReducer from "./slices/cartSlice";
import tipsReducer from "./slices/tipsSlice";
import userReducer from "./slices/userSlice";
import promoReducer from "./slices/promoSlice";
import languageReducer from "./slices/languageSlice";
import currencyReducer from "./slices/currencySlice";
import categoryReducer from "./slices/categorySlice";
import productMetaReducer from "./slices/productMetaSlice";

import { autoSaveMiddleware } from "../middleware/autoSaveMiddleware";

const rootReducer = combineReducers({
  cart: cartReducer,
  tips: tipsReducer,
  user: userReducer,
  promo: promoReducer,
  category: categoryReducer,
  productMeta: productMetaReducer,
  language: languageReducer,
  currency: currencyReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    "user",
    "cart",
    "promo",
    "productMeta",
    "tips",
    "currency",
    "language",
  ],
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

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

declare module "redux" {
  interface Dispatch {
    <ReturnType = void>(asyncAction: AppThunk<ReturnType>): ReturnType;
  }
}

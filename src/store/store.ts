import { configureStore } from "@reduxjs/toolkit";

import categoryReducer from "./slices/categorySlice";
import cartReducer from "./slices/cartSlice";
import registrationReducer from "./slices/registrationSlice";

export const store = configureStore({
  reducer: {
    category: categoryReducer,
    cart: cartReducer,
    registration: registrationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

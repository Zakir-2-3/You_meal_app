import { configureStore } from "@reduxjs/toolkit";
import  counterReduce  from "./slices/counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReduce,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

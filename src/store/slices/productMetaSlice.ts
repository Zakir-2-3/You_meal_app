import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SortBy = "default" | "price" | "rating" | "favorites";
export type SortDir = "asc" | "desc";

export interface ProductMetaState {
  ratings: Record<string, number>;
  favorites: string[];
  sort: { by: SortBy; dir: SortDir };
  metaSynced: boolean;
}

const initialState: ProductMetaState = {
  ratings: {},
  favorites: [],
  sort: { by: "default", dir: "desc" },
  metaSynced: false,
};

const productMetaSlice = createSlice({
  name: "productMeta",
  initialState,
  reducers: {
    setSort(state, action: PayloadAction<{ by: SortBy; dir: SortDir }>) {
      state.sort = action.payload;
    },
    setRating(state, action: PayloadAction<{ id: string; value: number }>) {
      const v = Math.max(1, Math.min(5, Math.round(action.payload.value)));
      state.ratings[action.payload.id] = v;
    },
    setManyRatings(state, action: PayloadAction<Record<string, number>>) {
      for (const [k, v] of Object.entries(action.payload)) {
        const vv = Math.max(1, Math.min(5, Math.round(v)));
        state.ratings[k] = vv;
      }
    },
    toggleFavorite(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter((x) => x !== id);
      } else {
        state.favorites.push(id);
      }
    },
    hydrateMeta(state, action: PayloadAction<Partial<ProductMetaState>>) {
      if (action.payload.ratings) state.ratings = action.payload.ratings;
      if (action.payload.favorites) state.favorites = action.payload.favorites;
      if (action.payload.sort) state.sort = action.payload.sort;
      state.metaSynced = true;
    },
    resetMeta(state) {
      state.metaSynced = false;
    },
    setMetaSynced(state, action: PayloadAction<boolean>) {
      state.metaSynced = action.payload;
    },
  },
});

export const {
  setSort,
  setRating,
  setManyRatings,
  toggleFavorite,
  hydrateMeta,
  resetMeta,
  setMetaSynced,
} = productMetaSlice.actions;

export default productMetaSlice.reducer;

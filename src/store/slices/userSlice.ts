import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { DEFAULT_AVATAR } from "@/constants/user/defaults";

import { UserState } from "@/types/store/user-slice";

const initialState: UserState = {
  isRegFormOpen: false,
  isAuth: false,
  name: "",
  email: "",
  balance: 0,
  avatarUrl: DEFAULT_AVATAR,
  geoCity: "",
  isUserDataLoaded: false,
  isHydrated: false,
  isGoogleSignIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },
    activeRegForm(state, action: PayloadAction<boolean>) {
      state.isRegFormOpen = action.payload;
    },
    setGeoCity(state, action: PayloadAction<string>) {
      state.geoCity = action.payload;
    },
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setAuthStatus(state, action: PayloadAction<boolean>) {
      state.isAuth = action.payload;
    },
    setAvatarUrl(state, action: PayloadAction<string>) {
      state.avatarUrl = action.payload || DEFAULT_AVATAR;
    },
    setBalance(state, action: PayloadAction<number>) {
      state.balance = action.payload;
    },
    setUserDataLoaded(state, action: PayloadAction<boolean>) {
      state.isUserDataLoaded = action.payload;
    },
    signOutUser(state) {
      state.isRegFormOpen = false;
      state.isAuth = false;
      state.name = "";
      state.email = "";
      state.balance = 0;
      state.avatarUrl = DEFAULT_AVATAR;
      state.isUserDataLoaded = true;
    },
    resetUser: (state) => {
      state.name = "";
      state.email = "";
      state.avatarUrl = DEFAULT_AVATAR;
      state.isAuth = false;
      state.balance = 0;
      state.isUserDataLoaded = true;
    },
    resetUserExceptGeoCity: (state) => {
      state.isRegFormOpen = false;
      state.isAuth = false;
      state.name = "";
      state.email = "";
      state.balance = 0;
      state.avatarUrl = DEFAULT_AVATAR;
      state.isUserDataLoaded = true;
    },
    setGoogleSignIn(state, action: PayloadAction<boolean>) {
      state.isGoogleSignIn = action.payload;
    },
  },
});

export const {
  activeRegForm,
  setGeoCity,
  setName,
  setEmail,
  setAuthStatus,
  setAvatarUrl,
  signOutUser,
  setBalance,
  resetUser,
  resetUserExceptGeoCity,
  setUserDataLoaded,
  setHydrated,
  setGoogleSignIn,
} = userSlice.actions;

export default userSlice.reducer;

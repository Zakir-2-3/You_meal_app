export interface UserState {
  isRegFormOpen: boolean;
  isAuth: boolean;
  name: string;
  email: string;
  balance: number;
  avatarUrl: string;
  geoCity?: string;
  isUserDataLoaded: boolean;
  isHydrated: boolean;
  isGoogleSignIn: boolean;
}

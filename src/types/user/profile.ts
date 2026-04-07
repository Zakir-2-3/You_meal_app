export interface UserProfile {
  name: string;
  email: string;
  balance: number;
  avatarUrl: string;
  isAuth: boolean;
}

export interface UserSession {
  isGoogleUser: boolean;
  email?: string;
  avatarUrl?: string;
}

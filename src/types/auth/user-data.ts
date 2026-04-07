export interface RegForm {
  name: string;
  email: string;
  password: string;
  repeatPassword?: string;
}

export interface UserData {
  email: string;
  name?: string;
  city?: string;
  cart?: any[];
  promoCodes?: {
    activated: string[];
    customAvailable: string[];
  };
  balance?: number;
  avatar?: string;
}

export interface UseUserDataLoaderReturn {
  loadUserData: (email: string) => Promise<void>;
}

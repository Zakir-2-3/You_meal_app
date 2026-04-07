import { AppDispatch } from "@/store/store";

export interface UseUserAvatarProps {
  email: string | null;
  avatarUrl: string;
  dispatch: AppDispatch;
  translations: {
    avatarDeleted: string;
    avatarDeleteFailed: string;
  };
}

export interface UseUserAvatarReturn {
  shouldAnimateAvatar: boolean;
  handleDeleteAvatar: () => Promise<void>;
}

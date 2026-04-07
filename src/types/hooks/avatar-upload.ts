export interface AvatarUploadTranslations {
  avatarAdded: string;
  avatarUpdated: string;
  avatarSaveFailed: string;
}

export interface UseAvatarUploadProps {
  email: string | null;
  onClose: () => void;
}

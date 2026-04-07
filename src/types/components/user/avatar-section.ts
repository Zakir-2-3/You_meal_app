export interface AvatarSectionProps {
  avatarUrl: string;
  shouldAnimateAvatar: boolean;
  showAvatarUploader: boolean;
  onShowUploader: () => void;
  onDeleteAvatar: () => void;
  onCloseUploader: () => void;
  translations: {
    uploadAvatar: string;
    changeTr: string;
    deleteTr: string;
  };
}

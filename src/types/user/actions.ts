export interface ActionButtonsProps {
  onSignOut: () => void;
  onDeleteAccount: () => void;
  translations: {
    signOutAccountTr: string;
    deleteAccountTr: string;
  };
}

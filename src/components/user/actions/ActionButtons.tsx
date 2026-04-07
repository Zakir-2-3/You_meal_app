"use client";

import { ActionButtonsProps } from "@/types/user/actions";

const ActionButtons = ({
  onSignOut,
  onDeleteAccount,
  translations,
}: ActionButtonsProps) => {
  return (
    <div className="personal-account__actions-bottom">
      <button
        className="personal-account__button--sign-out"
        onClick={onSignOut}
      >
        {translations.signOutAccountTr}
      </button>

      <button
        className="personal-account__button--sign-out personal-account__button--danger"
        onClick={onDeleteAccount}
      >
        {translations.deleteAccountTr}
      </button>
    </div>
  );
};

export default ActionButtons;

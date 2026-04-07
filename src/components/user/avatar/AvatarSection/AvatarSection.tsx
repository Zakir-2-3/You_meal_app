"use client";

import AvatarUploader from "@/components/user/avatar/AvatarUploader/AvatarUploader";

import { DEFAULT_AVATAR } from "@/constants/user/defaults";

import { AvatarSectionProps } from "@/types/components/user/avatar-section";

const AvatarSection = ({
  avatarUrl,
  shouldAnimateAvatar,
  showAvatarUploader,
  onShowUploader,
  onDeleteAvatar,
  onCloseUploader,
  translations,
}: AvatarSectionProps) => {
  return (
    <div className="personal-account__left">
      <img
        src={avatarUrl || DEFAULT_AVATAR}
        className={`personal-account__avatar ${
          shouldAnimateAvatar ? "animate-avatar" : ""
        }`}
        width={350}
        height={350}
        alt="avatar"
      />
      <div className="personal-account__actions">
        <button
          className="personal-account__button personal-account__button--edit"
          onClick={onShowUploader}
        >
          {avatarUrl === DEFAULT_AVATAR
            ? translations.uploadAvatar
            : translations.changeTr}
        </button>
        <button
          className="personal-account__button personal-account__button--delete"
          onClick={onDeleteAvatar}
          disabled={avatarUrl === DEFAULT_AVATAR}
        >
          {translations.deleteTr}
        </button>
      </div>
      {showAvatarUploader && <AvatarUploader onClose={onCloseUploader} />}
    </div>
  );
};

export default AvatarSection;

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
  const getHighResAvatarUrl = (url: string, size = 350) => {
    if (!url.includes("googleusercontent")) return url;
    return url.replace(/=s\d+(-c)?/, `=s${size}`);
  };

  return (
    <div className="personal-account__left">
      <img
        src={
          avatarUrl?.includes("googleusercontent")
            ? getHighResAvatarUrl(avatarUrl)
            : avatarUrl || DEFAULT_AVATAR
        }
        className={`personal-account__avatar ${
          shouldAnimateAvatar ? "animate-avatar" : ""
        }`}
        width={350}
        height={350}
        alt="avatar"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
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

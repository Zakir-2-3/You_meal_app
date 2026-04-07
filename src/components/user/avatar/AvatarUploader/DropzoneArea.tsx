import Image from "next/image";

import { useTranslate } from "@/hooks/app/useTranslate";

import { DropzoneAreaProps } from "@/types/components/user/dropzone-area";

import uploadFileIcon from "@/assets/icons/upload-file-icon.svg";

export default function DropzoneArea({
  getRootProps,
  getInputProps,
}: DropzoneAreaProps) {
  const { t } = useTranslate();
  const { avatarUploadText } = t.user;

  return (
    <div className="dropzone" {...getRootProps()}>
      <input className="crop__input" {...getInputProps()} />
      <div className="crop__content">
        <Image
          src={uploadFileIcon}
          className="crop__icon"
          width={100}
          height={100}
          alt="upload-file-icon"
        />
        <p className="crop__text">{avatarUploadText}</p>
      </div>
    </div>
  );
}

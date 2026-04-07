import { useAppSelector } from "@/store/store";

import { useTranslate } from "@/hooks/app/useTranslate";
import { useModalClose } from "@/hooks/user/avatar/useModalClose";
import { useAvatarUpload } from "@/hooks/user/avatar/useAvatarUpload";

import CropArea from "./CropArea";
import DropzoneArea from "./DropzoneArea";

import CloseButton from "@/UI/buttons/CloseButton/CloseButton";

import { AvatarUploaderProps } from "@/types/components/user/avatar-uploader";

import "./AvatarUploader.scss";

export default function AvatarUploader({ onClose }: AvatarUploaderProps) {
  const email = useAppSelector((state) => state.user.email);
  const { t } = useTranslate();

  const { closeAvatarUploadWindowAriaLabel } = t.buttons;

  const {
    imageSrc,
    crop,
    zoom,
    getRootProps,
    getInputProps,
    onCropComplete,
    showCroppedImage,
    handleResetImage,
    handleZoomChange,
    setCrop,
    setZoom,
  } = useAvatarUpload({ email, onClose });

  const { closing, modalRef, handleRequestClose } = useModalClose({
    onClose,
    imageSrc,
  });

  return (
    <div className="modal-overlay">
      <div
        className={`modal-content ${closing ? "modal-close-anim" : ""}`}
        ref={modalRef}
      >
        <CloseButton
          className="modal-close"
          onClick={handleRequestClose}
          width={20}
          height={20}
          ariaLabel={closeAvatarUploadWindowAriaLabel}
        />

        <div className="crop-wrapper">
          {!imageSrc ? (
            <DropzoneArea
              getRootProps={getRootProps}
              getInputProps={getInputProps}
            />
          ) : (
            <CropArea
              imageSrc={imageSrc}
              crop={crop}
              zoom={zoom}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              onSave={showCroppedImage}
              onReset={handleResetImage}
              onZoomAdjust={handleZoomChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

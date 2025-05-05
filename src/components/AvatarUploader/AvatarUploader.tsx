import { useState, useEffect, useCallback, useRef } from "react";

import Cropper from "react-easy-crop";
import { useDropzone } from "react-dropzone";

import { getCroppedImg } from "@/utils/cropImage";

import Image from "next/image";

import searchCloseIcon from "@/assets/icons/search-close-icon.svg";
import uploadFileIcon from "@/assets/icons/upload-file-icon.svg";

import "./AvatarUploader.scss";

function AvatarUploader({
  onSave,
  onClose,
}: {
  onSave: (img: string) => void;
  onClose: () => void;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [closing, setClosing] = useState(false);

  const modalRef = useRef<HTMLDivElement | null>(null);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setImageSrc(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
  });

  const showCroppedImage = useCallback(async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onSave(croppedImage);
      onClose();
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels, onSave, onClose]);

  const handleResetImage = () => {
    setImageSrc(null);
    setZoom(1);
  };

  const handleZoomChange = (newZoom: number) => {
    if (newZoom < 1) newZoom = 1;
    if (newZoom > 3) newZoom = 3;
    setZoom(newZoom);
  };

  const handleRequestClose = () => {
    if (imageSrc) {
      const confirmed = window.confirm(
        "Изображение не будет сохранено. Вы уверены, что хотите выйти?"
      );
      if (!confirmed) return;
    }

    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 300); // время анимации закрытия
  };

  // Закрытие попапа на Esc или Клик вне
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleRequestClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleRequestClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleRequestClose]);

  return (
    <div className="modal-overlay">
      <div
        className={`modal-content ${closing ? "modal-close-anim" : ""}`}
        ref={modalRef}
      >
        <button className="modal-close" onClick={handleRequestClose}>
          <Image
            src={searchCloseIcon}
            width={25}
            height={25}
            alt="close-btn-icon"
          />
        </button>

        <div className="crop-wrapper">
          {!imageSrc ? (
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
                <p className="crop__text">
                  Перетащите файлы сюда или кликните для загрузки.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="crop-container">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="controls">
                <div className="controls__zoom">
                  <button
                    type="button"
                    onClick={() => handleZoomChange(zoom - 0.1)}
                    className="controls__zoom-button"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="controls__zoom-slider"
                  />
                  <button
                    type="button"
                    onClick={() => handleZoomChange(zoom + 0.1)}
                    className="controls__zoom-button"
                  >
                    +
                  </button>
                </div>

                <div className="controls__actions">
                  <button
                    type="button"
                    className="controls__button controls__button--primary"
                    onClick={showCroppedImage}
                  >
                    Сохранить
                  </button>
                  <button
                    type="button"
                    className="controls__button controls__button--secondary"
                    onClick={handleResetImage}
                  >
                    Изменить
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AvatarUploader;

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

import Cropper from "react-easy-crop";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { store, useAppSelector } from "@/store/store";
import { setAvatarUrl } from "@/store/slices/userSlice";

import { getCroppedImg } from "@/utils/cropImage";

import { supabase } from "@/lib/supabaseClient";

import { DEFAULT_AVATAR } from "@/constants/defaults";

import CloseButton from "@/ui/buttons/CloseButton";

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

  const email = useAppSelector((state) => state.user.email);

  const dispatch = useDispatch();

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
      if (!email) throw new Error("Не найден email пользователя");

      const previousAvatarUrl = store.getState().user.avatarUrl;
      const isDefaultBefore = previousAvatarUrl === DEFAULT_AVATAR;

      // Создаем временный Blob URL для мгновенного отображения
      const croppedBlob = (await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        "blob"
      )) as Blob;
      const tempUrl = URL.createObjectURL(croppedBlob);

      const currentTempUrl = tempUrl;

      // Немедленно обновляем аватарку (временная версия)
      onSave(tempUrl);

      // Фоновая обработка серверных операций
      const fileName = `${email}_${Date.now()}.jpg`;

      onClose();

      // Удаление старой аватарки
      if (
        previousAvatarUrl &&
        !isDefaultBefore &&
        previousAvatarUrl.includes("/avatars/")
      ) {
        const match = previousAvatarUrl.match(/avatars\/(.+\.jpg)/);
        const previousFileName = match?.[1];
        if (previousFileName) {
          await fetch("/api/avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: previousFileName }),
          });
        }
      }

      // Загрузка новой аватарки
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, croppedBlob, {
          cacheControl: "3600",
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      // Получение постоянного URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Обновляем на постоянный URL (без анимации)
      if (store.getState().user.avatarUrl === currentTempUrl) {
        dispatch(setAvatarUrl(publicUrl));
      }

      toast.success(
        isDefaultBefore ? "Аватарка добавлена" : "Аватарка обновлена"
      );

      // Обновляем в базе данных
      const state = store.getState();
      await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          avatar: publicUrl,
          cart: state.cart.items,
          promoCodes: {
            activated: state.promo.activated,
            available: state.promo.available,
          },
          balance: state.user.balance,
        }),
      });

      // Освобождаем временный Blob URL
      URL.revokeObjectURL(tempUrl);
    } catch (e) {
      console.error("Ошибка сохранения аватарки:", e);
      toast.error("Не удалось сохранить аватарку");
    }
  }, [imageSrc, croppedAreaPixels, onSave, onClose, email, dispatch]);

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
        <CloseButton onClick={handleRequestClose} className="modal-close" />

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
                  Перетащите файл сюда или кликните для загрузки.
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

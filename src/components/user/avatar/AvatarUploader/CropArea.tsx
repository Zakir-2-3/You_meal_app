import { useState } from "react";

import Cropper from "react-easy-crop";

import { useTranslate } from "@/hooks/app/useTranslate";

import { CropAreaProps } from "@/types/components/user/crop-area";

export default function CropArea({
  imageSrc,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onSave,
  onReset,
  onZoomAdjust,
}: CropAreaProps) {
  const { t } = useTranslate();
  const { save, changeTr } = t.buttons;
  const [localZoom, setLocalZoom] = useState(zoom);

  const handleZoomChange = (value: number) => {
    setLocalZoom(value);
    onZoomChange(value);
  };

  const handleZoomButton = (delta: number) => {
    const newZoom = localZoom + delta;
    const clampedZoom = Math.min(3, Math.max(1, newZoom));
    onZoomAdjust(clampedZoom);
  };

  return (
    <>
      <div className="crop-container">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={localZoom}
          aspect={1}
          cropShape="round"
          onCropChange={onCropChange}
          onZoomChange={handleZoomChange}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="controls">
        <div className="controls__zoom">
          <button
            type="button"
            onClick={() => handleZoomButton(-0.1)}
            className="controls__zoom-button"
          >
            -
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={localZoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="controls__zoom-slider"
          />
          <button
            type="button"
            onClick={() => handleZoomButton(0.1)}
            className="controls__zoom-button"
          >
            +
          </button>
        </div>

        <div className="controls__actions">
          <button
            type="button"
            className="controls__button controls__button--primary"
            onClick={onSave}
          >
            {save}
          </button>
          <button
            type="button"
            className="controls__button controls__button--secondary"
            onClick={onReset}
          >
            {changeTr}
          </button>
        </div>
      </div>
    </>
  );
}

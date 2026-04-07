import { useState, useCallback } from "react";

export const useImageCrop = () => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.min(3, Math.max(1, newZoom));
    setZoom(clamped);
  };

  const handleResetImage = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  return {
    crop,
    setCrop,
    zoom,
    setZoom,
    croppedAreaPixels,
    onCropComplete,
    handleZoomChange,
    handleResetImage,
  };
};

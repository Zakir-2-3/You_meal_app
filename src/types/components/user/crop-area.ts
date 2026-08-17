export interface CropAreaProps {
  imageSrc: string;
  crop: { x: number; y: number };
  zoom: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
  onSave: () => void;
  onReset: () => void;
  onChangeImage?: () => void;
  onZoomAdjust: (newZoom: number) => void;
  isUploading?: boolean;
  isCropped?: boolean;
}

import { useState } from "react";
import { useDropzone } from "react-dropzone";

export const useDropzoneHandler = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result as string);
        reader.readAsDataURL(file);
      }
    },
  });

  return {
    imageSrc,
    setImageSrc,
    getRootProps,
    getInputProps,
  };
};

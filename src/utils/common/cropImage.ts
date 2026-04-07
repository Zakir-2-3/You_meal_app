export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  type: "blob" | "base64" = "blob"
): Promise<Blob | string> => {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const AVATAR_SIZE = 330;
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;

  // Обрезка круглого аватара
  ctx.beginPath();
  ctx.arc(AVATAR_SIZE / 2, AVATAR_SIZE / 2, AVATAR_SIZE / 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE
  );

  if (type === "blob") {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg");
    });
  }

  return canvas.toDataURL("image/jpeg");
};

const createImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.crossOrigin = "anonymous";
    image.src = url;
  });
};

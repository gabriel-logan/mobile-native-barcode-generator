import { ensureGalleryPermission } from "./internal/galleryPermission";
import { validateFileName, validateSaveInput } from "./internal/validation";
import NativeBarcodeGenerator from "./specs/NativeMobileNativeBarcodeGenerator";

export default async function saveQRCodeToGallery(
  value: string,
  width: number,
  height: number,
  fileName: string,
): Promise<string> {
  validateSaveInput(value, width, height);
  validateFileName(fileName);

  await ensureGalleryPermission();

  return NativeBarcodeGenerator.saveQRCodeToGallery(
    value,
    width,
    height,
    fileName,
  );
}

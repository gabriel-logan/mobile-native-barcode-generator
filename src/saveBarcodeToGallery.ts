import {ensureGalleryPermission} from './internal/galleryPermission';
import {validateBarcodeInput, validateFileName} from './internal/validation';
import NativeBarcodeGenerator from './specs/NativeMobileNativeBarcodeGenerator';

export default async function saveBarcodeToGallery(
  value: string,
  width: number,
  height: number,
  fileName: string,
): Promise<string> {
  validateBarcodeInput(value, width, height);
  validateFileName(fileName);

  await ensureGalleryPermission();

  return NativeBarcodeGenerator.saveBarcodeToGallery(
    value,
    width,
    height,
    fileName,
  );
}

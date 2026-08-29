import NativeBarcodeGenerator from './specs/NativeMobileNativeBarcodeGenerator';
import {validateQRCodeInput} from './internal/validation';

const PNG_DATA_URI_PREFIX = 'data:image/png;base64,';

export default async function generateQRCode(
  value: string,
  width: number,
  height: number,
): Promise<string> {
  validateQRCodeInput(value, width, height);

  const base64 = NativeBarcodeGenerator.generateQRCode(value, width, height);

  return `${PNG_DATA_URI_PREFIX}${base64}`;
}

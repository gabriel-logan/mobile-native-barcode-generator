import NativeBarcodeGenerator from "./specs/NativeMobileNativeBarcodeGenerator";
import { validateBarcodeInput } from "./internal/validation";

const PNG_DATA_URI_PREFIX = "data:image/png;base64,";

export default async function generateBarcode(
  value: string,
  width: number,
  height: number,
): Promise<string> {
  validateBarcodeInput(value, width, height);

  const base64 = await NativeBarcodeGenerator.generateBarcode(
    value,
    width,
    height,
  );

  return `${PNG_DATA_URI_PREFIX}${base64}`;
}

import generateBarcode from "../generateBarcode";
import { validateBarcodeInput } from "../internal/validation";
import type { BarcodeViewProps } from "./types.web";
import useGeneratedImage from "./useGeneratedImage";

export default function BarcodeView({
  value,
  width,
  height,
  testID,
  style,
  onLoad,
  onError,
  onGenerationError,
}: BarcodeViewProps) {
  const uri = useGeneratedImage(
    generateBarcode,
    validateBarcodeInput,
    value,
    width,
    height,
    onGenerationError,
  );

  if (uri === undefined) {
    return null;
  }

  return (
    <img
      data-testid={testID}
      src={uri}
      style={{ width, height, ...style }}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

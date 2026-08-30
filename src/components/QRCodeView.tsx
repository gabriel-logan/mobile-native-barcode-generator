import { Image } from "react-native";

import generateQRCode from "../generateQRCode";
import { validateQRCodeInput } from "../internal/validation";
import type { QRCodeViewProps } from "./types";
import useGeneratedImage from "./useGeneratedImage";

export default function QRCodeView({
  value,
  width,
  height,
  testID,
  style,
  onLoad,
  onError,
  onGenerationError,
}: QRCodeViewProps) {
  const uri = useGeneratedImage(
    generateQRCode,
    validateQRCodeInput,
    value,
    width,
    height,
    onGenerationError,
  );

  if (uri === undefined) {
    return null;
  }

  return (
    <Image
      testID={testID}
      source={{ uri }}
      style={[{ width, height }, style]}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

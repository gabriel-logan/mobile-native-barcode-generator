import {Image} from 'react-native';

import generateQRCode from '../generateQRCode';
import {validateQRCodeInput} from '../internal/validation';
import type {QRCodeViewProps} from './types';
import useGeneratedImage from './useGeneratedImage';

export default function QRCodeView({
  value,
  width,
  height,
  testID,
  style,
  onLoad,
  onError,
}: QRCodeViewProps) {
  validateQRCodeInput(value, width, height);

  const uri = useGeneratedImage(generateQRCode, value, width, height);

  if (uri === undefined) {
    return null;
  }

  return (
    <Image
      testID={testID}
      source={{uri}}
      style={[{width, height}, style]}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

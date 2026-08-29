import {Image} from 'react-native';

import generateBarcode from '../generateBarcode';
import {validateBarcodeInput} from '../internal/validation';
import type {BarcodeViewProps} from './types';
import useGeneratedImage from './useGeneratedImage';

export default function BarcodeView({
  value,
  width,
  height,
  testID,
  style,
  onLoad,
  onError,
}: BarcodeViewProps) {
  validateBarcodeInput(value, width, height);

  const uri = useGeneratedImage(generateBarcode, value, width, height);

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

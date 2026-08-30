import type { ImageProps, ImageStyle, StyleProp } from "react-native";

type ImageStyleWithoutDimensions = Omit<
  ImageStyle,
  "height" | "maxHeight" | "maxWidth" | "minHeight" | "minWidth" | "width"
>;

export interface CodeViewProps {
  value: string;
  width: number;
  height: number;
  testID?: string;
  style?: StyleProp<ImageStyleWithoutDimensions>;
  onLoad?: ImageProps["onLoad"];
  onError?: ImageProps["onError"];
  /**
   * Called when the value cannot be encoded — invalid input, or a failure in
   * the C++ core. Providing it makes the component render nothing instead of
   * throwing during render, which is what you want when `value` comes from
   * somewhere it can legitimately be empty, such as a text input.
   */
  onGenerationError?: (error: Error) => void;
}

export type BarcodeViewProps = CodeViewProps;
export type QRCodeViewProps = CodeViewProps;

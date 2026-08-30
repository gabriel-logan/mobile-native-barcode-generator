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
}

export type BarcodeViewProps = CodeViewProps;
export type QRCodeViewProps = CodeViewProps;

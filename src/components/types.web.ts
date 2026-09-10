import type { CSSProperties, SyntheticEvent } from "react";

export interface CodeViewProps {
  value: string;
  width: number;
  height: number;
  testID?: string;
  style?: CSSProperties;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
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

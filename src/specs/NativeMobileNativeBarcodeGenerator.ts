import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  readonly generateBarcode: (
    value: string,
    width: number,
    height: number,
  ) => string;

  readonly generateQRCode: (
    value: string,
    width: number,
    height: number,
  ) => string;

  readonly saveBarcodeToGallery: (
    value: string,
    width: number,
    height: number,
    fileName: string,
  ) => string;

  readonly saveQRCodeToGallery: (
    value: string,
    width: number,
    height: number,
    fileName: string,
  ) => string;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  "NativeMobileNativeBarcodeGenerator",
);

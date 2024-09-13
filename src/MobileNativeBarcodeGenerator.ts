import { NativeModules, Platform } from "react-native";

import type { MobileNativeBarcodeGeneratorType } from "./types/MobileNativeBarcodeGeneratorType";
import MobileNativeBarcodeGeneratorWeb from "./web/MobileNativeBarcodeGeneratorWeb";

let MobileNativeBarcodeGenerator: MobileNativeBarcodeGeneratorType;

const isMobile = Platform.OS === "ios" || Platform.OS === "android";

const isWeb = Platform.OS === "web";

if (isMobile) {
	const MOBILE_LINKING_ERROR =
		`The package 'mobile-native-barcode-generator' doesn't seem to be linked. Make sure: \n\n` +
		Platform.select({ ios: "- You have run 'pod install'\n", default: "" }) +
		"- You rebuilt the app after installing the package\n" +
		"- You are not using Expo Go\n";

	MobileNativeBarcodeGenerator = NativeModules.MobileNativeBarcodeGenerator
		? NativeModules.MobileNativeBarcodeGenerator
		: new Proxy(
				{},
				{
					get() {
						throw new Error(MOBILE_LINKING_ERROR);
					},
				},
			);
} else if (isWeb) {
	MobileNativeBarcodeGenerator = new MobileNativeBarcodeGeneratorWeb();
} else {
	throw new Error("Unsupported platform");
}

export default MobileNativeBarcodeGenerator;

// const isWindows = Platform.OS === "windows";

// const isMacOS = Platform.OS === "macos";

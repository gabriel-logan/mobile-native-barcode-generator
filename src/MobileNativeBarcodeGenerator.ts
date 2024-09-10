import { NativeModules, Platform } from "react-native";

import type { MobileNativeBarcodeGeneratorType } from "./types/Components";

const LINKING_ERROR =
	`The package 'mobile-native-barcode-generator' doesn't seem to be linked. Make sure: \n\n` +
	Platform.select({ ios: "- You have run 'pod install'\n", default: "" }) +
	"- You rebuilt the app after installing the package\n" +
	"- You are not using Expo Go\n";

const MobileNativeBarcodeGenerator: MobileNativeBarcodeGeneratorType =
	NativeModules.MobileNativeBarcodeGenerator
		? NativeModules.MobileNativeBarcodeGenerator
		: new Proxy(
				{},
				{
					get() {
						throw new Error(LINKING_ERROR);
					},
				},
			);

export default MobileNativeBarcodeGenerator;

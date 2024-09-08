import { Platform } from "react-native";

import { generateQRCode } from "../index";

jest.mock("react-native", () => ({
	NativeModules: {},
	Platform: {
		select: jest.fn().mockImplementation((obj) => obj.default),
	},
}));

describe("NativeModules", () => {
	it("should throw an error if MobileNativeBarcodeGenerator class is not available", async () => {
		const LINKING_ERROR =
			`The package 'mobile-native-barcode-generator' doesn't seem to be linked. Make sure: \n\n` +
			Platform.select({ ios: "- You have run 'pod install'\n", default: "" }) +
			"- You rebuilt the app after installing the package\n" +
			"- You are not using Expo Go\n";

		await expect(generateQRCode("test", 100, 100)).rejects.toThrow(
			LINKING_ERROR,
		);
	});
});

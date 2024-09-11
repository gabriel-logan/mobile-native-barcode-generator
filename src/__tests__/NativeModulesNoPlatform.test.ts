import { Platform } from "react-native";

describe("NativeModules Unsupported platform", () => {
	it("should throw an error if platform is not supported", () => {
		// Mock Platform.OS to be an unsupported platform
		Platform.OS = "unknown" as typeof Platform.OS;

		expect(() => {
			// Dynamically import the module to trigger the platform check
			require("../MobileNativeBarcodeGenerator");
		}).toThrow("Unsupported platform");
	});
});

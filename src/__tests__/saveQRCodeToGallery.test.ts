import { saveQRCodeToGallery } from "..";

jest.mock("react-native", () => ({
	NativeModules: {
		MobileNativeBarcodeGenerator: {
			saveQRCodeToGallery: jest.fn().mockResolvedValue("saveQRCodeToGallery"),
		},
	},
	Platform: {
		select: jest.fn().mockImplementation((obj) => obj.default),
		OS: "android",
	},
}));

describe("saveQRCodeToGallery", () => {
	it("should return string for saving QR code to gallery", async () => {
		const result = await saveQRCodeToGallery("value", 100, 100, "fileName");

		expect(result).toBe("saveQRCodeToGallery");
	});

	it("should throw an error if value is empty", async () => {
		await expect(saveQRCodeToGallery("", 100, 100, "fileName")).rejects.toThrow(
			"Value cannot be empty",
		);
	});

	it("should throw an error if width is not a positive number", async () => {
		await expect(
			saveQRCodeToGallery("value", -1, 100, "fileName"),
		).rejects.toThrow("Width must be a positive number");
	});

	it("should throw an error if height is not a positive number", async () => {
		await expect(
			saveQRCodeToGallery("value", 100, -1, "fileName"),
		).rejects.toThrow("Height must be a positive number");
	});

	it("should throw an error if filename is empty", async () => {
		await expect(saveQRCodeToGallery("value", 100, 100, "")).rejects.toThrow(
			"Filename cannot be empty",
		);
	});
});

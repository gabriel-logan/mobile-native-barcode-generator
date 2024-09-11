import MobileNativeBarcodeGeneratorWeb from "./MobileNativeBarcodeGeneratorWeb";

describe("MobileNativeBarcodeGenerator Web", () => {
	describe("generateBarcode", () => {
		it("should generate a barcode", async () => {
			const generator = new MobileNativeBarcodeGeneratorWeb();
			const result = await generator.generateBarcode("123", 100, 100);
			expect(result).toBe("123100100barcode");
		});
	});

	describe("generateQRCode", () => {
		it("should generate a QR code", async () => {
			const generator = new MobileNativeBarcodeGeneratorWeb();
			const result = await generator.generateQRCode("123", 100, 100);
			expect(result).toBe("123100100qrcode");
		});
	});

	describe("saveQRCodeToGallery", () => {
		it("should save a QR code to the gallery", async () => {
			const generator = new MobileNativeBarcodeGeneratorWeb();
			const result = await generator.saveQRCodeToGallery(
				"123",
				100,
				100,
				"qrcode",
			);
			expect(result).toBe("123100100qrcodesaved qrcode");
		});
	});

	describe("saveBarcodeToGallery", () => {
		it("should save a barcode to the gallery", async () => {
			const generator = new MobileNativeBarcodeGeneratorWeb();
			const result = await generator.saveBarcodeToGallery(
				"123",
				100,
				100,
				"barcode",
			);
			expect(result).toBe("123100100barcodesaved barcode");
		});
	});
});

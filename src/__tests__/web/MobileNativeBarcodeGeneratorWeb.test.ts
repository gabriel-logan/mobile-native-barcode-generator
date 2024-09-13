import MobileNativeBarcodeGeneratorWeb from "../../web/MobileNativeBarcodeGeneratorWeb";

const QR_CODE_RESULT =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAACE0lEQVR4nO3cwW7sIAxG4abq+79y7upWdIGKZZscmvMtR5kJ0i9bhDBc933fH8L4fHoA+slAYAwExkBgDATGQGAMBMZAYAwExkBgDATGQGAMBMZAYAwExkBgDATmq+qHruuq+qlvKy8zx/uO1698XqXypasVAmMgMGUta5Qp4WhLydxr5zhXWSEwBgLT0rJGK6XdMZuKtqOqcWZZITAGAtPesqrM2sXs81kro7NCYAwE5piWNdq5TrWbFQJjIDDtLat7hjNrU9H7UmZiVgiMgcC0tKyO2U7mzeDKwyOFFQJjIDBlLYsyS/kvuvZFYYXAGAjM1n1ZO9edut9UdrFCYAwE5tp5+Ey0/DNtLfPwGH2odCvpH2YgMFv3ZT21O302npmOfV+rrBAYA4FpmWVF3+JlZl/Rdpe5fmUMWVYIjIHAPLYva9YuqmZls2sy7XQHKwTGQGAe+49hx4PVylvCqtmRD4YvYSAwR57ksHKv6BrUyvU7ZlxWCIyBwBx/kkN0DJlWtoMVAmMgMMec5BD9btWS/uxeLr+/hIHAHPO36JUHtKr9V5n9WllWCIyBwBzTsqr2cWWud5b1QgYCc+RJDtHl99l4MpsfnGW9hIHAHHOSwyi6fhVtTbPrnWW9kIHAbP2PoX5nhcAYCIyBwBgIjIHAGAiMgcAYCIyBwBgIjIHAGAiMgcAYCIyBwBgIjIHAGAjMPz3OGNguGlzVAAAAAElFTkSuQmCC";

describe("MobileNativeBarcodeGenerator Web", () => {
	describe("generateBarcode", () => {
		it("should generate a barcode", async () => {
			const generator = new MobileNativeBarcodeGeneratorWeb();
			const result = await generator.generateBarcode("123", 100, 100);

			expect(result).toBe(QR_CODE_RESULT);
		});
	});

	describe("generateQRCode", () => {
		it("should generate a QR code", async () => {
			const generator = new MobileNativeBarcodeGeneratorWeb();
			const result = await generator.generateQRCode("123", 100, 100);

			expect(result).toBe(QR_CODE_RESULT);
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

export default class MobileNativeBarcodeGeneratorWeb {
	async generateBarcode(value: string, width: number, height: number) {
		return value + width + height + "barcode";
	}

	async generateQRCode(value: string, width: number, height: number) {
		return value + width + height + "qrcode";
	}

	async saveQRCodeToGallery(
		value: string,
		width: number,
		height: number,
		fileName: string,
	) {
		return value + width + height + fileName + "saved qrcode";
	}

	async saveBarcodeToGallery(
		value: string,
		width: number,
		height: number,
		fileName: string,
	) {
		return value + width + height + fileName + "saved barcode";
	}
}

export interface MobileNativeBarcodeGeneratorType {
	generateBarcode: (
		value: string,
		width: number,
		height: number,
	) => Promise<string>;

	generateQRCode: (
		value: string,
		width: number,
		height: number,
	) => Promise<string>;

	saveBarcodeToGallery: (
		value: string,
		width: number,
		height: number,
		fileName: string,
	) => Promise<string>;

	saveQRCodeToGallery: (
		value: string,
		width: number,
		height: number,
		fileName: string,
	) => Promise<string>;
}

import type { EncodeHintType } from "@zxing/library";
import { MultiFormatWriter, BarcodeFormat } from "@zxing/library";
import { createCanvas } from "canvas";

export default class MobileNativeBarcodeGeneratorWeb {
	writer = new MultiFormatWriter();
	hints = new Map<EncodeHintType, any>();

	async generateBarcode(value: string, width: number, height: number) {
		const result = this.writer.encode(
			value,
			BarcodeFormat.QR_CODE,
			width,
			height,
			this.hints,
		);

		// Create a canvas and draw the QR code
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext("2d");

		const imageData = ctx.createImageData(width, height);
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const offset = (y * width + x) * 4;
				const bit = result.get(x, y) ? 0 : 255;
				imageData.data[offset] = bit;
				imageData.data[offset + 1] = bit;
				imageData.data[offset + 2] = bit;
				imageData.data[offset + 3] = 255;
			}
		}
		ctx.putImageData(imageData, 0, 0);

		// Convert the canvas to a Base64 string
		const canvasResult = canvas.toDataURL();

		const cleanResult = canvasResult.replace("data:image/png;base64,", "");

		return cleanResult;
	}

	async generateQRCode(value: string, width: number, height: number) {
		const result = this.writer.encode(
			value,
			BarcodeFormat.QR_CODE,
			width,
			height,
			this.hints,
		);

		// Create a canvas and draw the QR code
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext("2d");

		const imageData = ctx.createImageData(width, height);
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const offset = (y * width + x) * 4;
				const bit = result.get(x, y) ? 0 : 255;
				imageData.data[offset] = bit;
				imageData.data[offset + 1] = bit;
				imageData.data[offset + 2] = bit;
				imageData.data[offset + 3] = 255;
			}
		}
		ctx.putImageData(imageData, 0, 0);

		// Convert the canvas to a Base64 string
		const canvasResult = canvas.toDataURL();

		const cleanResult = canvasResult.replace("data:image/png;base64,", "");

		return cleanResult;
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

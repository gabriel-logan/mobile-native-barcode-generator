import MobileNativeBarcodeGenerator from "./MobileNativeBarcodeGenerator";

export default async function saveBarcodeToGallery(
	value: string,
	width: number,
	height: number,
	fileName: string,
) {
	if (value === "") {
		throw new Error("Value cannot be empty");
	}

	if (width <= 0 || typeof width !== "number") {
		throw new Error("Width must be a positive number");
	}

	if (height <= 0 || typeof height !== "number") {
		throw new Error("Height must be a positive number");
	}

	if (fileName.trim() === "") {
		throw new Error("Filename cannot be empty");
	}

	const result: string =
		await MobileNativeBarcodeGenerator.saveBarcodeToGallery(
			value,
			width,
			height,
			fileName,
		);

	return result;
}

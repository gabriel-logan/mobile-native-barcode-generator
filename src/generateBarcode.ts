import MobileNativeBarcodeGenerator from "./MobileNativeBarcodeGenerator";

export default async function generateBarcode(
	value: string,
	width: number,
	height: number,
): Promise<string> {
	if (value.length > 80) {
		throw new Error("Barcode value length must be less than 80 characters");
	}

	const returnValue = await MobileNativeBarcodeGenerator.generateBarcode(
		value,
		width,
		height,
	);

	const finalReturn = `data:image/png;base64,${returnValue}`;

	return finalReturn;
}

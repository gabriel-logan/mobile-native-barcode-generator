import MobileNativeBarcodeGenerator from "./MobileNativeBarcodeGenerator";

export default async function generateQRCode(
	value: string,
	width: number,
	height: number,
): Promise<string> {
	if (value.length > 2500) {
		throw new Error("QR code value length must be less than 2500 characters");
	}

	const returnValue = await MobileNativeBarcodeGenerator.generateQRCode(
		value,
		width,
		height,
	);

	const finalReturn = `data:image/png;base64,${returnValue}`;

	return finalReturn;
}

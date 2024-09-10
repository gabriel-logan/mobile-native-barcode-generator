import MobileNativeBarcodeGenerator from "./MobileNativeBarcodeGenerator";

export default async function generateBarcode(
	value: string,
	width: number,
	height: number,
): Promise<string> {
	const returnValue = await MobileNativeBarcodeGenerator.generateBarcode(
		value,
		width,
		height,
	);

	const finalReturn = `data:image/png;base64,${returnValue}`;

	return finalReturn;
}

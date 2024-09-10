import { useEffect, useState } from "react";
import { NativeModules, Platform, Image } from "react-native";

interface GeneralViewProps {
	value: string;
	width: number;
	height: number;
}

interface QRCodeViewProps extends GeneralViewProps {}

interface BarcodeViewProps extends GeneralViewProps {}

const LINKING_ERROR =
	`The package 'mobile-native-barcode-generator' doesn't seem to be linked. Make sure: \n\n` +
	Platform.select({ ios: "- You have run 'pod install'\n", default: "" }) +
	"- You rebuilt the app after installing the package\n" +
	"- You are not using Expo Go\n";

const MobileNativeBarcodeGenerator = NativeModules.MobileNativeBarcodeGenerator
	? NativeModules.MobileNativeBarcodeGenerator
	: new Proxy(
			{},
			{
				get() {
					throw new Error(LINKING_ERROR);
				},
			},
		);

export async function generateQRCode(
	value: string,
	width: number,
	height: number,
): Promise<string> {
	const returnValue = await MobileNativeBarcodeGenerator.generateQRCode(
		value,
		width,
		height,
	);

	const finalReturn = `data:image/png;base64,${returnValue}`;

	return finalReturn;
}

export async function generateBarcode(
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

export function QRCodeView({ value, width, height }: QRCodeViewProps) {
	const [barcode, setBarcode] = useState<string | undefined>("");

	if (value === "") {
		throw new Error("Value cannot be empty");
	}

	if (width <= 0 || typeof width !== "number") {
		throw new Error("Width must be a positive number");
	}

	if (height <= 0 || typeof height !== "number") {
		throw new Error("Height must be a positive number");
	}

	useEffect(() => {
		async function waitFor() {
			const qrCodeGeneradet = await generateQRCode(value, width, height);

			setBarcode(qrCodeGeneradet);
		}

		waitFor();

		return () => {
			setBarcode("");
		};
	}, [height, value, width]);

	return (
		<>
			{barcode && (
				<Image
					testID="qr-code"
					source={{ uri: barcode }}
					style={{
						width,
						height,
					}}
				/>
			)}
		</>
	);
}

export function BarcodeView({ value, width, height }: BarcodeViewProps) {
	const [barcode, setBarcode] = useState<string | undefined>("");

	if (value === "") {
		throw new Error("Value cannot be empty");
	}

	if (width <= 0 || typeof width !== "number") {
		throw new Error("Width must be a positive number");
	}

	if (height <= 0 || typeof height !== "number") {
		throw new Error("Height must be a positive number");
	}

	useEffect(() => {
		async function waitFor() {
			const barcodeGeneradet = await generateBarcode(value, width, height);

			setBarcode(barcodeGeneradet);
		}

		waitFor();

		return () => {
			setBarcode("");
		};
	}, [height, value, width]);

	return (
		<>
			{barcode && (
				<Image
					testID="barcode"
					source={{ uri: barcode }}
					style={{
						width,
						height,
					}}
				/>
			)}
		</>
	);
}

export async function saveQRCodeToGallery(
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

	const result: string = await MobileNativeBarcodeGenerator.saveQRCodeToGallery(
		value,
		width,
		height,
		fileName,
	);
	return result;
}

export async function saveBarcodeToGallery(
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

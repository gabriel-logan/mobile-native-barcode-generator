import { useEffect, useState } from "react";
import { NativeModules, Platform, Image } from "react-native";

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

interface QRCodeViewProps {
	value: string;
	width: number;
	height: number;
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
		generateQRCode(value, width, height).then(setBarcode);

		return () => {
			setBarcode("");
		};
	}, [height, value, width]);

	return (
		<>
			{barcode && (
				<Image
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

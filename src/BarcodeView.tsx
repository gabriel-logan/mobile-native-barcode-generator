import { useEffect, useState } from "react";
import { Image } from "react-native";

import generateBarcode from "./generateBarcode";
import type { BarcodeViewProps } from "./types/Components";

export default function BarcodeView({
	value,
	width,
	height,
}: BarcodeViewProps) {
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

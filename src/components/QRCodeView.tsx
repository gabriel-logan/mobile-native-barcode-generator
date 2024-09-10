import { useEffect, useState } from "react";
import { Image } from "react-native";

import generateQRCode from "../generateQRCode";
import type { QRCodeViewProps } from "../types/Components";

export default function QRCodeView({
	testID,
	value,
	width,
	height,
	style,
	onLoad,
	onError,
}: QRCodeViewProps) {
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
					testID={testID}
					source={{ uri: barcode }}
					style={[
						{
							width,
							height,
						},
						style,
					]}
					onLoad={onLoad}
					onError={onError}
				/>
			)}
		</>
	);
}

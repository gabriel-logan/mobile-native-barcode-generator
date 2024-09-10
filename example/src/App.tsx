/* eslint-disable react-native/no-inline-styles */
import {
	BarcodeView,
	QRCodeView,
	saveBarcodeToGallery,
	saveQRCodeToGallery,
} from "mobile-native-barcode-generator";
import { useState } from "react";
import { StyleSheet, View, Text, TextInput, Button, Alert } from "react-native";

export default function App() {
	const [value, setValue] = useState<string>("");
	const [barcodeValue, setBarcodeValue] = useState<string>("");
	const [toggleGenCode, setToggleGenCode] = useState("QR");

	async function buttonToSaveOnGallery() {
		try {
			const result1 = await saveBarcodeToGallery(
				"BARRACODE",
				300,
				100,
				"CODE128",
			);

			const result2 = await saveQRCodeToGallery(
				"Hello Man",
				300,
				300,
				"GEREINEGAO",
			);

			Alert.alert("Success", `${result1} and ${result2}`);
		} catch (error) {
			Alert.alert("Error", error as string);
		}
	}

	return (
		<View style={styles.container}>
			<Text>Result: </Text>
			{barcodeValue &&
				(toggleGenCode === "QR" ? (
					<QRCodeView value={barcodeValue} width={250} height={250} />
				) : (
					<BarcodeView value={barcodeValue} width={300} height={100} />
				))}
			<TextInput
				value={value}
				onChangeText={setValue}
				placeholder="Type Here"
			/>
			<View style={{ gap: 15 }}>
				<Button
					title="Generate QR Code"
					onPress={() => setBarcodeValue(value)}
				/>
				<Button
					title="Toggle QR/Barcode"
					onPress={() =>
						setToggleGenCode(toggleGenCode === "QR" ? "Barcode" : "QR")
					}
				/>
				<Button title="Save on Gallery" onPress={buttonToSaveOnGallery} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});

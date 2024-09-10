import {
	BarcodeView,
	QRCodeView,
	saveBarcodeToGallery,
	saveQRCodeToGallery,
} from "mobile-native-barcode-generator";
import { useState } from "react";
import { StyleSheet, View, Text, TextInput, Button, Alert } from "react-native";

export default function MainPage() {
	const [value, setValue] = useState<string>("");
	const [barcodeValue, setBarcodeValue] = useState<string>("");
	const [toggleGenCode, setToggleGenCode] = useState("QR");

	async function buttonToSaveOnGallery() {
		try {
			const result1 = await saveBarcodeToGallery(
				"BAR_CODE",
				300,
				100,
				"CODE128",
			);

			const result2 = await saveQRCodeToGallery(
				"QR_CODE",
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
			<Text style={styles.resultText}>Result: </Text>
			{barcodeValue &&
				(toggleGenCode === "QR" ? (
					<QRCodeView value={barcodeValue} width={250} height={250} />
				) : (
					<BarcodeView value={barcodeValue} width={300} height={100} />
				))}
			<TextInput
				style={styles.input}
				value={value}
				onChangeText={setValue}
				placeholder="Type Here"
			/>
			<View style={styles.buttonContainer}>
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
		backgroundColor: "#f5f5f5",
		padding: 20,
	},
	resultText: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 20,
	},
	input: {
		height: 40,
		borderColor: "gray",
		borderWidth: 1,
		borderRadius: 5,
		paddingHorizontal: 10,
		marginBottom: 20,
		width: "80%",
		color: "black",
		marginTop: 20,
	},
	buttonContainer: {
		gap: 15,
		width: "80%",
	},
});

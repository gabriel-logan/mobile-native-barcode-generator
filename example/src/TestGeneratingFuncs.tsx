/* eslint-disable no-console */
import {
	generateBarcode,
	generateQRCode,
} from "mobile-native-barcode-generator";
import { Button, Text, View, StyleSheet } from "react-native";

export default function TestGeneratingFuncs() {
	async function generateQRCodeFunc() {
		const result = await generateQRCode("Hello World", 300, 300);

		console.log(result);
	}

	async function generateBarCodeFunc() {
		const result = await generateBarcode("123", 300, 300);

		console.log(result);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>TestGeneratingFuncs</Text>
			<View style={styles.buttonContainer}>
				<Button title="Generate QR Code" onPress={generateQRCodeFunc} />
				<Button title="Generate Bar Code" onPress={generateBarCodeFunc} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#1c1c1c",
		padding: 16,
	},
	title: {
		fontSize: 24,
		color: "#ffffff",
		marginBottom: 16,
	},
	buttonContainer: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-around",
	},
});

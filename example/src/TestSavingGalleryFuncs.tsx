/* eslint-disable no-console */
import { saveQRCodeToGallery } from "mobile-native-barcode-generator";
import { Button, StyleSheet, Text, View } from "react-native";

export default function TestSavingGalleryFuncs() {
	async function saveQRToGalleryFunc() {
		const result = await saveQRCodeToGallery("QR_CODE", 300, 300, "mynameisqr");

		console.log(result);
	}

	async function saveBarCodeToGalleryFunc() {
		const result = await saveQRCodeToGallery(
			"BAR_CODE",
			300,
			100,
			"mynameisbarcode",
		);

		console.log(result);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>TestSavingGalleryFuncs</Text>
			<View style={styles.buttonContainer}>
				<Button title="Save QR Code" onPress={saveQRToGalleryFunc} />
				<Button title="Save Bar Code" onPress={saveBarCodeToGalleryFunc} />
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

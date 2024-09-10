import {
	BarcodeView,
	QRCodeView,
	saveBarcodeToGallery,
	saveQRCodeToGallery,
} from "mobile-native-barcode-generator";
import { useState } from "react";
import {
	StyleSheet,
	View,
	Text,
	TextInput,
	Button,
	Alert,
	TouchableOpacity,
	Linking,
} from "react-native";

export default function MainPage() {
	const [value, setValue] = useState<string>("");
	const [barcodeValue, setBarcodeValue] = useState<string>(
		"https://encurtador.com.br/yulae",
	);
	const [toggleGenCode, setToggleGenCode] = useState("QR");

	async function buttonToSaveOnGallery() {
		try {
			const result1 = await saveBarcodeToGallery(
				"BAR_CODE",
				300,
				100,
				"CODE128",
			);

			const result2 = await saveQRCodeToGallery("QR_CODE", 300, 300, "QR_CODE");

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
					<QRCodeView value={barcodeValue} width={200} height={200} />
				) : (
					<BarcodeView value={barcodeValue} width={200} height={100} />
				))}
			<TextInput
				style={styles.input}
				value={value}
				onChangeText={setValue}
				placeholder="Type Here"
				placeholderTextColor="gray"
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
			<View style={styles.linkContainer}>
				<Text style={styles.linkText}>
					You can test QR and Barcode using my app on playstore
				</Text>
				<TouchableOpacity
					onPress={() => {
						Linking.openURL(
							"https://play.google.com/store/apps/details?id=com.gabriellogan.noadqrbarcodescanner",
						);
					}}
					style={styles.linkButton}
				>
					<Text style={styles.linkButtonText}>
						https://play.google.com/store/apps/details?id=com.gabriellogan.noadqrbarcodescanner
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#121212",
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
		marginTop: 20,
		color: "white",
	},
	buttonContainer: {
		gap: 15,
		width: "80%",
	},
	linkContainer: {
		marginTop: 20,
		alignItems: "center",
	},
	linkText: {
		color: "white",
		fontSize: 16,
		marginBottom: 10,
		textAlign: "center",
	},
	linkButton: {
		backgroundColor: "#1E90FF",
		padding: 10,
		borderRadius: 5,
	},
	linkButtonText: {
		color: "white",
		fontSize: 14,
		textAlign: "center",
	},
});

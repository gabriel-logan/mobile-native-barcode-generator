import { BarcodeView } from "mobile-native-barcode-generator";
import { View, StyleSheet } from "react-native";

export default function TestBarCodeView() {
	return (
		<View style={styles.container}>
			<BarcodeView value="123" width={300} height={100} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#121212", // Fundo escuro
	},
	barcode: {
		margin: 10,
	},
});

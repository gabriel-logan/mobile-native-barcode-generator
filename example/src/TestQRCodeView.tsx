import { QRCodeView } from "mobile-native-barcode-generator";
import { StyleSheet, View } from "react-native";

export default function TestQRCodeView() {
	return (
		<View style={styles.container}>
			<QRCodeView value="123" width={300} height={300} />
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
});

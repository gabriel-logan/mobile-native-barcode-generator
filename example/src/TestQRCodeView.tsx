import { QRCodeView } from "mobile-native-barcode-generator";
import { View } from "react-native";

export default function TestQRCodeView() {
	return (
		<View>
			<QRCodeView value="Hello World" width={300} height={300} />
		</View>
	);
}

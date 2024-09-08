# mobile-native-barcode-generator

Library to generate barcodes and qr codes natively using Kotlin and Swift, integrated with react native.

## Supported Frameworks

- React Native - ✅
- Expo - ❌ - [See Expo Version](https://github.com/gabriel-logan/expo-barcode)

## Supported Architectures

- Android - ✅
- Ios - ❌
- Windows - ❌
- Mac - ❌
- Linux - ❌

## Installation

```sh
npm install mobile-native-barcode-generator
```

```sh
yarn add mobile-native-barcode-generator
```

## Usage

### Available methods

```js
import {
	BarcodeView,
	QRCodeView,
	generateBarcode,
	generateQRCode,
} from "mobile-native-barcode-generator";
```

### Using the components

#### Simple example

```js
import { QRCodeView } from "mobile-native-barcode-generator";

export default function App() {
	return (
		<View style={styles.container}>
			<QRCodeView value={"Hello World!"} width={250} height={250} />
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
```

```js
import { BarcodeView, QRCodeView } from "mobile-native-barcode-generator";
import { useState } from "react";
import { StyleSheet, View, Text, TextInput, Button } from "react-native";

export default function App() {
	const [value, setValue] = useState("");
	const [barcodeValue, setBarcodeValue] = useState("");
	const [toggleGenCode, setToggleGenCode] = useState("QR");

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
			<Button title="Generate QR Code" onPress={() => setBarcodeValue(value)} />
			<Button
				title="Toggle QR/Barcode"
				onPress={() =>
					setToggleGenCode(toggleGenCode === "QR" ? "Barcode" : "QR")
				}
			/>
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
```

### Using generating functions

```js
import { generateBarcode, generateQRCode } from "mobile-native-barcode-generator";

async function waitForIt() {
    const qrCodeGenerated = await generateQRCode("Hello", 200, 200);

    console.log(qrCodeGenerated);

    const barCodeGenerated = await generateBarcode("Hello", 300, 200);

    console.log(barCodeGenerated);
}

waitForIt();
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## Contributors

- Gabriel Logan - Creator

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

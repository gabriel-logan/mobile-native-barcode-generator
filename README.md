> [!NOTE]
> I accept help to make the IOS version.

# Mobile Native Barcode Generator

- mobile-native-barcode-generator

[![npm version](https://badge.fury.io/js/mobile-native-barcode-generator.svg)](https://badge.fury.io/js/mobile-native-barcode-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/mobile-native-barcode-generator.svg?style=flat-square)](https://npm-stat.com/charts.html?package=mobile-native-barcode-generator)

Library to generate barcodes and qr codes natively using Kotlin and Swift, integrated with react native.

## Supported Frameworks

- React Native - ✅
- Expo GO - ❌ - [See Expo Version](https://github.com/gabriel-logan/expo-barcode)

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
	saveBarcodeToGallery,
	saveQRCodeToGallery,
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

### Saving generated image to internal gallery

- [README](https://github.com/gabriel-logan/mobile-native-barcode-generator/blob/main/docs/saveToGallery)

## Test using Jest

- [README](https://github.com/gabriel-logan/mobile-native-barcode-generator/blob/main/docs/TEST.md)

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## Contributors

- Gabriel Logan - Creator

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

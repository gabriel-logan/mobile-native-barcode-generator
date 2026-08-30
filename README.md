# Mobile Native Barcode Generator

- mobile-native-barcode-generator

[![npm version](https://badge.fury.io/js/mobile-native-barcode-generator.svg)](https://badge.fury.io/js/mobile-native-barcode-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/mobile-native-barcode-generator.svg?style=flat-square)](https://npm-stat.com/charts.html?package=mobile-native-barcode-generator)

Cross-platform React Native barcode and QR code generation implemented in C++.

Code 128 encoding, QR encoding and PNG output live in a single shared C++ core
exposed as a Turbo Module, so Android and iOS produce byte-identical images from
the same code, with no Kotlin or Swift generation logic and no third-party
encoding dependency.

On the web that same core is compiled to WebAssembly, so react-native-web builds
get the same images from the same encoder rather than a separate JavaScript
implementation.

## Supported Frameworks

- React Native (New Architecture) - ✅
- Expo with a development build - ✅
- Expo GO - ❌ - [See Expo Version](https://github.com/gabriel-logan/expo-barcode)

Expo is supported as long as the app is not running inside Expo Go. This is a
native module, and Expo Go ships a fixed set of native code it cannot extend, so
it needs a [development build](https://docs.expo.dev/develop/development-builds/introduction/)
or `expo prebuild` — both of which autolink it like any other native module.

## Supported Platforms

- Android - ✅
- iOS - ✅
- Web - ✅ (react-native-web, via WebAssembly)
- Windows - ❌
- Mac - ❌

## Requirements

- React Native >= 0.76 with the New Architecture enabled
- Expo (optional): SDK 52 or newer, with the New Architecture enabled and a
  development build
- React >= 18.3.1
- Android: minSdk 24, compileSdk 36, Java 17
- iOS: the minimum version supported by your React Native release, C++20
- Web: react-native-web and a browser with WebAssembly (every current browser)

## Installation

```sh
npm install mobile-native-barcode-generator
```

```sh
pnpm add mobile-native-barcode-generator
```

```sh
yarn add mobile-native-barcode-generator
```

On iOS, install the pods afterwards:

```sh
cd ios && pod install
```

Autolinking handles the rest; there is no manual native setup.

### Expo

Install it the same way, then produce a build that can carry native code:

```sh
npx expo prebuild
npx expo run:android   # or: npx expo run:ios
```

From then on autolinking handles it, exactly as in a bare React Native app. No
config plugin is needed — but the gallery permissions below have to go in
`app.json` instead of `AndroidManifest.xml` and `Info.plist`, since prebuild
regenerates those files.

### Web

Nothing extra to install. The package ships a prebuilt WebAssembly module and
your bundler resolves the `.web.js` platform extension to it, the same way it
does for your own web-only files.

The wasm binary is embedded in the JavaScript module, so there is no `.wasm`
asset to copy, serve or configure — it adds roughly 74 KB (about 26 KB gzipped)
to your bundle and is instantiated lazily on the first generation call.

If your webpack config lists `resolve.extensions` explicitly, make sure the web
extensions come first:

```js
resolve: {
  alias: { 'react-native$': 'react-native-web' },
  extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
}
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

```jsx
import { QRCodeView } from "mobile-native-barcode-generator";
import { StyleSheet, View } from "react-native";

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

```jsx
import { BarcodeView, QRCodeView } from "mobile-native-barcode-generator";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

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

#### Component props

`BarcodeView` and `QRCodeView` share the same props:

| Prop                | Type                     | Required | Description                                                       |
| ------------------- | ------------------------ | -------- | ----------------------------------------------------------------- |
| `value`             | `string`                 | yes      | Content to encode.                                                |
| `width`             | `number`                 | yes      | Image width in pixels (positive integer, max 4096).               |
| `height`            | `number`                 | yes      | Image height in pixels (positive integer, max 4096).              |
| `style`             | `StyleProp<ImageStyle>`  | no       | Extra image styles. Width and height are controlled by the props. |
| `testID`            | `string`                 | no       | Forwarded to the underlying `Image`.                              |
| `onLoad`            | `ImageProps["onLoad"]`   | no       | Forwarded to the underlying `Image`.                              |
| `onError`           | `ImageProps["onError"]`  | no       | Forwarded to the underlying `Image`.                              |
| `onGenerationError` | `(error: Error) => void` | no       | Called when the value cannot be encoded. See below.               |

The components render `null` while the image is being generated. What happens
when generation fails depends on whether you pass `onGenerationError`:

- **Without it**, the error is thrown during render, so an
  [error boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
  can catch invalid input. With no boundary above it, the error takes down the
  screen.
- **With it**, the error is handed to your callback and the component renders
  nothing. Use this whenever `value` comes from somewhere it can legitimately be
  empty or wrong — a text input, an API response — since an empty string is
  invalid input and would otherwise crash the tree on every keystroke that
  clears the field:

```tsx
const [error, setError] = useState<string>();

<BarcodeView
  value={value}
  width={300}
  height={100}
  onGenerationError={(reason) => setError(reason.message)}
/>;
{
  error !== undefined && <Text>{error}</Text>;
}
```

`onGenerationError` covers encoding failures; `onError` is the underlying
`Image`'s own load error and is left untouched.

The exported types are `CodeViewProps`, `BarcodeViewProps` and `QRCodeViewProps`.

### Using generating functions

Both functions resolve with a `data:image/png;base64,...` URI, ready to hand to
an `Image` source.

```js
import {
  generateBarcode,
  generateQRCode,
} from "mobile-native-barcode-generator";

async function waitForIt() {
  const qrCodeGenerated = await generateQRCode("Hello", 200, 200);

  console.log(qrCodeGenerated);

  const barCodeGenerated = await generateBarcode("Hello", 300, 200);

  console.log(barCodeGenerated);
}

waitForIt();
```

### Limits and validation

Input is validated in JavaScript before reaching the native side, and the call
rejects with an `Error` when it is invalid:

- `value` cannot be empty.
- Barcode (Code 128) values are limited to 80 characters.
- QR code values are limited to 2500 characters.
- `width` and `height` must be positive integers not greater than 4096.
- `fileName` cannot be empty or blank when saving to the gallery.

The save functions do not apply the barcode/QR length limits.

### Saving generated image to internal gallery

`saveBarcodeToGallery` and `saveQRCodeToGallery` generate the PNG in C++ and
write it to the device gallery. They resolve with the location of the saved
image: a `content://` URI on Android, a `ph://` asset identifier on iOS.

On the web there is no gallery to write to, so the browser equivalent is used:
the PNG is offered to the user as a download (the filename gains a `.png`
extension if it does not have one) and the call resolves with the image as a
`data:image/png;base64,...` URI.

```ts
import {
  saveBarcodeToGallery,
  saveQRCodeToGallery,
} from "mobile-native-barcode-generator";

async function buttonToSaveOnGallery() {
  const result1 = await saveBarcodeToGallery(
    "BAR_CODE", // Value
    300, // Width
    100, // Height
    "CODE128", // Filename
  );

  const result2 = await saveQRCodeToGallery(
    "QR_CODE", // Value
    300, // Width
    300, // Height
    "QR_CODE", // Filename
  );

  console.log("Success", `${result1} and ${result2}`);
}
```

#### Web

Browsers gate downloads themselves, so no permission is requested. Saving needs
a real document, which means it cannot run during server-side rendering — call
it from an event handler or an effect.

#### Android permissions

On Android 10 (API 29) and above the image is written through `MediaStore` and
no permission is required. On older versions the library requests
`WRITE_EXTERNAL_STORAGE` for you, so declare it in your app's
`AndroidManifest.xml`:

```xml
<uses-permission
  android:name="android.permission.WRITE_EXTERNAL_STORAGE"
  android:maxSdkVersion="28" />
```

If the user denies it, the call rejects with
`Permission to save images to the gallery was denied`.

#### iOS permissions

Saving uses the Photos library with add-only access. Add a usage description to
your app's `Info.plist`, otherwise iOS terminates the app when the prompt would
appear:

```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Save the generated barcodes to your photo library.</string>
```

The authorization prompt is shown on the first save; a denied or restricted
status makes the call reject.

#### Expo permissions

`expo prebuild` regenerates `AndroidManifest.xml` and `Info.plist`, so edits to
those files are lost. Declare the same permissions in `app.json` instead:

```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.WRITE_EXTERNAL_STORAGE"]
    },
    "ios": {
      "infoPlist": {
        "NSPhotoLibraryAddUsageDescription": "Save the generated barcodes to your photo library."
      }
    }
  }
}
```

`android.permissions` cannot express the `maxSdkVersion="28"` shown above, so
the permission is declared for every version. That does not change runtime
behaviour — the library only requests it below API 29 — but it does show up on
the store listing; narrow it with a config plugin if that matters. You can skip
the Android entry entirely if your app targets API 29 or above.

## Test using Jest

The library calls a Turbo Module, and `TurboModuleRegistry.getEnforcing` throws
when the native module is missing — which is always the case under Jest. Mock
the native spec module before importing the library:

```jsx
jest.mock(
  "mobile-native-barcode-generator/dist/specs/NativeMobileNativeBarcodeGenerator",
  () => ({
    __esModule: true,
    default: {
      generateBarcode: jest.fn().mockResolvedValue("barcode-base64"),
      generateQRCode: jest.fn().mockResolvedValue("qr-code-base64"),
      saveBarcodeToGallery: jest.fn().mockResolvedValue("content://barcode"),
      saveQRCodeToGallery: jest.fn().mockResolvedValue("content://qr-code"),
    },
  }),
);

import { generateQRCode } from "mobile-native-barcode-generator";

test("returns a data URI", async () => {
  await expect(generateQRCode("hello", 200, 200)).resolves.toBe(
    "data:image/png;base64,qr-code-base64",
  );
});
```

The native generation methods resolve with the base64 payload, and the gallery
methods resolve with the saved location. This keeps the real validation, the
real `data:image/png;base64,` prefix and the real components.

If you only care that your screen renders a code, mock the whole package
instead:

```jsx
jest.mock("mobile-native-barcode-generator", () => {
  const { Image } = require("react-native");

  return {
    generateQRCode: jest.fn().mockResolvedValue("mockedQRCode"),
    generateBarcode: jest.fn().mockResolvedValue("mockedBarcode"),
    saveBarcodeToGallery: jest.fn().mockResolvedValue("saveBarcodeToGallery"),
    saveQRCodeToGallery: jest.fn().mockResolvedValue("saveQRCodeToGallery"),
    QRCodeView: () => <Image source={{ uri: "mockedQRCode" }} />,
    BarcodeView: () => <Image source={{ uri: "mockedBarcode" }} />,
  };
});
```

Because the components generate the image in an effect, wrap rendering in `act`
and await it before asserting.

## Example app

The [`example/`](https://github.com/gabriel-logan/mobile-native-barcode-generator/tree/main/example)
directory contains a React Native app that exercises every public API, plus a
test suite that pins the public contract.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## Contributors

- Gabriel Logan - Creator

## License

MIT

---

# Tests

## 1. Mock Setup for Jest

### Step 1: Create the `jest.setup.js` file
- **Location:** Root folder
- **Note:** If the file already exists, skip this step.

### Step 2: Add the following mock implementation to `jest.setup.js`

```js
jest.mock("mobile-native-barcode-generator", () => {
  const { Image } = require("react-native");

  return {
    generateQRCode: jest.fn().mockResolvedValue("mockedQRCode"),
    generateBarcode: jest.fn().mockResolvedValue("mockedBarcode"),
    QRCodeView: () => (
      <>
        <Image source={{ uri: "mockedQRCode" }} />
      </>
    ),
    BarcodeView: () => (
      <>
        <Image source={{ uri: "mockedBarcode" }} />
      </>
    ),
  };
});
```

### Step 3: Update `jest.config.js`
- If another setup file is already configured, you can place this file before or after the existing one. Alternatively, paste the mock code into the existing setup file.

```js
/** @type {import("jest").Config} */
const config = {
  preset: "react-native",
  setupFilesAfterEnv: ["@testing-library/react-native/extend-expect"],
  setupFiles: ["./jest.setup.js"], // HERE
};

module.exports = config;
```

### Step 4: Finalize and Run Tests
- **Review:** Ensure that all configurations are correctly set.
- **Run:** Execute your tests using Jest.
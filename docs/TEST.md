# Tests

## Mock Setup

### Step 1: Create the `jest.setup.js` file in the root folder
- If the file already exists, skip this step.

### Step 2: Add the following code to the setup file

```js
jest.mock("mobile-native-barcode-generator", () => {
  const { Image } = require("react-native");

  return {
    generateQRCode: jest.fn().mockResolvedValue("mockedQRCode"),
    generateBarcode: jest.fn().mockResolvedValue("mockedBarcode"),
    QRCodeView: () => (
      <>
        <Image source={{ uri: "mockedQRCode" }} width={200} height={200} />
      </>
    ),
    BarcodeView: () => (
      <>
        <Image source={{ uri: "mockedQRCode" }} width={200} height={100} />
      </>
    ),
  };
});
```

### Step 3: Add the setup file to `jest.config.js`
- If another setup file is already configured, you can add this before or after, or paste the mock into the existing setup file.

```js
/** @type {import("jest").Config} */
const config = {
  preset: "react-native",
  setupFilesAfterEnv: ["@testing-library/react-native/extend-expect"],
  setupFiles: ["./jest.setup.js"], // HERE
};

module.exports = config;
```

### Step 4: Finalize and run the tests
- Ensure all configurations are correct and execute the tests.
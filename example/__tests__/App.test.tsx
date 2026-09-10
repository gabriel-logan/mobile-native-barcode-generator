/**
 * @format
 */

import React from "react";
import ReactTestRenderer from "react-test-renderer";

jest.mock("mobile-native-barcode-generator", () => {
  const { View } = require("react-native");

  return {
    BarcodeView: View,
    QRCodeView: View,
    generateBarcode: jest.fn(),
    generateQRCode: jest.fn(),
    saveBarcodeToGallery: jest.fn(),
    saveQRCodeToGallery: jest.fn(),
  };
});

import App from "../App";

test("renders correctly", async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

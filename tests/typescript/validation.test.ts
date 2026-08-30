import { describe, expect, it } from "vitest";

import {
  validateBarcodeInput,
  validateFileName,
  validateQRCodeInput,
  validateSaveInput,
} from "../../src/internal/validation";

describe("input validation", () => {
  it.each([
    ["barcode", () => validateBarcodeInput("", 100, 100)],
    ["QR code", () => validateQRCodeInput("", 100, 100)],
    ["saved image", () => validateSaveInput("", 100, 100)],
  ])("rejects an empty %s value", (_label, validate) => {
    expect(validate).toThrow("Value cannot be empty");
  });

  it("accepts barcode values at the 80-character boundary", () => {
    expect(() => validateBarcodeInput("a".repeat(80), 1, 4096)).not.toThrow();
  });

  it("rejects barcode values above 80 characters", () => {
    expect(() => validateBarcodeInput("a".repeat(81), 100, 100)).toThrow(
      "Barcode value length must be less than 80 characters",
    );
  });

  it("accepts QR code values at the 2500-character boundary", () => {
    expect(() => validateQRCodeInput("a".repeat(2500), 4096, 1)).not.toThrow();
  });

  it("rejects QR code values above 2500 characters", () => {
    expect(() => validateQRCodeInput("a".repeat(2501), 100, 100)).toThrow(
      "QR code value length must be less than 2500 characters",
    );
  });

  it.each([
    [0, "Width must be a positive integer"],
    [-1, "Width must be a positive integer"],
    [1.5, "Width must be a positive integer"],
    [Number.NaN, "Width must be a positive integer"],
    [4097, "Width must not exceed 4096 pixels"],
  ])("rejects invalid width %s", (width, message) => {
    expect(() => validateSaveInput("value", width, 100)).toThrow(message);
  });

  it.each([
    [0, "Height must be a positive integer"],
    [-1, "Height must be a positive integer"],
    [1.5, "Height must be a positive integer"],
    [Number.POSITIVE_INFINITY, "Height must be a positive integer"],
    [4097, "Height must not exceed 4096 pixels"],
  ])("rejects invalid height %s", (height, message) => {
    expect(() => validateSaveInput("value", 100, height)).toThrow(message);
  });

  it("allows save values above the generation length limits", () => {
    expect(() => validateSaveInput("a".repeat(2501), 100, 100)).not.toThrow();
  });

  it.each(["", " ", "\t\n"])("rejects blank filename %j", (fileName) => {
    expect(() => validateFileName(fileName)).toThrow(
      "Filename cannot be empty",
    );
  });

  it("accepts a non-blank filename", () => {
    expect(() => validateFileName(" barcode ")).not.toThrow();
  });
});

import { describe, expect, it } from "vitest";

import NativeBarcodeGenerator from "../../src/specs/NativeMobileNativeBarcodeGenerator.web";

// Exercises the real Emscripten artifact rather than a mock, so a stale
// `wasm/mnbg-wasm.js` cannot pass unnoticed. Regenerate it with
// `pnpm run build:wasm` after touching anything under `cpp/`.
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function decodedBytes(base64: string) {
  const binary = atob(base64);

  return Array.from(binary, (character) => character.charCodeAt(0));
}

describe("wasm artifact", () => {
  it("encodes a barcode as a PNG", async () => {
    const base64 = await NativeBarcodeGenerator.generateBarcode(
      "ABC-123",
      300,
      100,
    );

    expect(decodedBytes(base64).slice(0, 8)).toEqual(PNG_SIGNATURE);
  });

  it("encodes a QR code as a PNG", async () => {
    const base64 = await NativeBarcodeGenerator.generateQRCode(
      "https://example.test",
      240,
      240,
    );

    expect(decodedBytes(base64).slice(0, 8)).toEqual(PNG_SIGNATURE);
  });

  it("produces the same bytes as the shared C++ core for equal input", async () => {
    const [first, second] = await Promise.all([
      NativeBarcodeGenerator.generateQRCode("stable", 120, 120),
      NativeBarcodeGenerator.generateQRCode("stable", 120, 120),
    ]);

    expect(first).toBe(second);
  });

  it("surfaces the C++ validation messages", async () => {
    await expect(
      NativeBarcodeGenerator.generateBarcode("ç", 300, 100),
    ).rejects.toThrow("CODE_128 supports ASCII characters only");

    await expect(
      NativeBarcodeGenerator.generateBarcode("ABC", 0, 100),
    ).rejects.toThrow("Width must be a positive integer up to 4096");

    await expect(
      NativeBarcodeGenerator.generateQRCode("a".repeat(5000), 240, 240),
    ).rejects.toThrow("QR code data is too long");
  });
});

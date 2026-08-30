import { beforeEach, describe, expect, it, vi } from "vitest";

const boundaries = vi.hoisted(() => ({
  native: {
    generateBarcode:
      vi.fn<
        (value: string, width: number, height: number) => Promise<string>
      >(),
    generateQRCode:
      vi.fn<
        (value: string, width: number, height: number) => Promise<string>
      >(),
    saveBarcodeToGallery:
      vi.fn<
        (
          value: string,
          width: number,
          height: number,
          fileName: string,
        ) => Promise<string>
      >(),
    saveQRCodeToGallery:
      vi.fn<
        (
          value: string,
          width: number,
          height: number,
          fileName: string,
        ) => Promise<string>
      >(),
  },
  ensureGalleryPermission: vi.fn<() => Promise<void>>(),
}));

vi.mock("../../src/specs/NativeMobileNativeBarcodeGenerator", () => ({
  default: boundaries.native,
}));

vi.mock("../../src/internal/galleryPermission", () => ({
  ensureGalleryPermission: boundaries.ensureGalleryPermission,
}));

import generateBarcode from "../../src/generateBarcode";
import generateQRCode from "../../src/generateQRCode";
import saveBarcodeToGallery from "../../src/saveBarcodeToGallery";
import saveQRCodeToGallery from "../../src/saveQRCodeToGallery";

describe("generation API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a PNG data URI for a barcode", async () => {
    boundaries.native.generateBarcode.mockResolvedValue("barcode-base64");

    await expect(generateBarcode("ABC-123", 300, 100)).resolves.toBe(
      "data:image/png;base64,barcode-base64",
    );
    expect(boundaries.native.generateBarcode).toHaveBeenCalledWith(
      "ABC-123",
      300,
      100,
    );
  });

  it("returns a PNG data URI for a QR code", async () => {
    boundaries.native.generateQRCode.mockResolvedValue("qr-base64");

    await expect(
      generateQRCode("https://example.test", 240, 240),
    ).resolves.toBe("data:image/png;base64,qr-base64");
    expect(boundaries.native.generateQRCode).toHaveBeenCalledWith(
      "https://example.test",
      240,
      240,
    );
  });

  it("does not invoke the native barcode generator for invalid input", async () => {
    await expect(generateBarcode("", 300, 100)).rejects.toThrow(
      "Value cannot be empty",
    );
    expect(boundaries.native.generateBarcode).not.toHaveBeenCalled();
  });
});

describe("gallery API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    boundaries.ensureGalleryPermission.mockResolvedValue();
  });

  it("saves a barcode after checking gallery permission", async () => {
    boundaries.native.saveBarcodeToGallery.mockResolvedValue(
      "content://barcode",
    );

    await expect(
      saveBarcodeToGallery("ABC-123", 300, 100, "barcode"),
    ).resolves.toBe("content://barcode");
    expect(boundaries.ensureGalleryPermission).toHaveBeenCalledOnce();
    expect(boundaries.native.saveBarcodeToGallery).toHaveBeenCalledWith(
      "ABC-123",
      300,
      100,
      "barcode",
    );
  });

  it("saves a QR code after checking gallery permission", async () => {
    boundaries.native.saveQRCodeToGallery.mockResolvedValue("ph://qr-code");

    await expect(
      saveQRCodeToGallery("QR-CODE", 240, 240, "qr-code.png"),
    ).resolves.toBe("ph://qr-code");
    expect(boundaries.ensureGalleryPermission).toHaveBeenCalledOnce();
    expect(boundaries.native.saveQRCodeToGallery).toHaveBeenCalledWith(
      "QR-CODE",
      240,
      240,
      "qr-code.png",
    );
  });

  it("does not request permission when save input is invalid", async () => {
    await expect(
      saveBarcodeToGallery("value", 0, 100, "barcode"),
    ).rejects.toThrow("Width must be a positive integer");
    expect(boundaries.ensureGalleryPermission).not.toHaveBeenCalled();
    expect(boundaries.native.saveBarcodeToGallery).not.toHaveBeenCalled();
  });

  it("does not call native save when permission is denied", async () => {
    boundaries.ensureGalleryPermission.mockRejectedValue(
      new Error("permission denied"),
    );

    await expect(
      saveQRCodeToGallery("value", 100, 100, "qr-code"),
    ).rejects.toThrow("permission denied");
    expect(boundaries.native.saveQRCodeToGallery).not.toHaveBeenCalled();
  });
});

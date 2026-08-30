import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MnbgWasmResult } from "../../wasm/mnbg-wasm.js";

const wasm = vi.hoisted(() => ({
  generateBarcodeBase64:
    vi.fn<(value: string, width: number, height: number) => MnbgWasmResult>(),
  generateQRCodeBase64:
    vi.fn<(value: string, width: number, height: number) => MnbgWasmResult>(),
}));

const createModule = vi.hoisted(() => vi.fn(() => Promise.resolve(wasm)));

vi.mock("../../wasm/mnbg-wasm.js", () => ({ default: createModule }));

// A one-pixel PNG, small enough to keep the base64 readable in assertions.
const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGP4DwABAQEAWk1v8QAAAABJRU5ErkJggg==";

interface RecordedDownload {
  href: string;
  download: string;
}

let downloads: RecordedDownload[] = [];
let appended = 0;
let removed = 0;

function installDocument() {
  downloads = [];
  appended = 0;
  removed = 0;

  vi.stubGlobal("document", {
    createElement: () => ({
      style: {} as Record<string, string>,
      href: "",
      download: "",
      rel: "",
      click(this: RecordedDownload) {
        downloads.push({ href: this.href, download: this.download });
      },
      remove: () => {
        removed += 1;
      },
    }),
    body: {
      appendChild: () => {
        appended += 1;
      },
    },
  });
}

describe("web turbo module", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    createModule.mockImplementation(() => Promise.resolve(wasm));
    installDocument();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function importWebModule() {
    return (
      await import("../../src/specs/NativeMobileNativeBarcodeGenerator.web")
    ).default;
  }

  it("returns the base64 the wasm core produced", async () => {
    wasm.generateBarcodeBase64.mockReturnValue({ value: PNG_BASE64 });
    wasm.generateQRCodeBase64.mockReturnValue({ value: PNG_BASE64 });

    const web = await importWebModule();

    await expect(web.generateBarcode("ABC-123", 300, 100)).resolves.toBe(
      PNG_BASE64,
    );
    expect(wasm.generateBarcodeBase64).toHaveBeenCalledWith(
      "ABC-123",
      300,
      100,
    );

    await expect(
      web.generateQRCode("https://example.test", 240, 240),
    ).resolves.toBe(PNG_BASE64);
    expect(wasm.generateQRCodeBase64).toHaveBeenCalledWith(
      "https://example.test",
      240,
      240,
    );
  });

  it("instantiates the wasm module once and shares it", async () => {
    wasm.generateQRCodeBase64.mockReturnValue({ value: PNG_BASE64 });

    const web = await importWebModule();

    await web.generateQRCode("one", 100, 100);
    await web.generateQRCode("two", 100, 100);

    expect(createModule).toHaveBeenCalledOnce();
  });

  it("retries instantiation after a failure", async () => {
    createModule.mockImplementationOnce(() =>
      Promise.reject(new Error("wasm unavailable")),
    );
    wasm.generateQRCodeBase64.mockReturnValue({ value: PNG_BASE64 });

    const web = await importWebModule();

    await expect(web.generateQRCode("value", 100, 100)).rejects.toThrow(
      "wasm unavailable",
    );
    await expect(web.generateQRCode("value", 100, 100)).resolves.toBe(
      PNG_BASE64,
    );
    expect(createModule).toHaveBeenCalledTimes(2);
  });

  it("rejects with the message the C++ core reported", async () => {
    wasm.generateBarcodeBase64.mockReturnValue({
      error: "CODE_128 supports ASCII characters only",
    });

    const web = await importWebModule();

    await expect(web.generateBarcode("ç", 300, 100)).rejects.toThrow(
      "CODE_128 supports ASCII characters only",
    );
  });

  it("rejects when the core returns neither a value nor an error", async () => {
    wasm.generateQRCodeBase64.mockReturnValue({});

    const web = await importWebModule();

    await expect(web.generateQRCode("value", 100, 100)).rejects.toThrow(
      "Failed to generate the image",
    );
  });

  it("downloads the PNG and resolves with a data URI when saving", async () => {
    wasm.generateQRCodeBase64.mockReturnValue({ value: PNG_BASE64 });

    const web = await importWebModule();

    await expect(
      web.saveQRCodeToGallery("value", 200, 200, "my-qr"),
    ).resolves.toBe(`data:image/png;base64,${PNG_BASE64}`);

    expect(downloads).toHaveLength(1);
    expect(downloads[0]?.download).toBe("my-qr.png");
    expect(appended).toBe(1);
    expect(removed).toBe(1);
  });

  it("keeps a filename that already ends in .png", async () => {
    wasm.generateBarcodeBase64.mockReturnValue({ value: PNG_BASE64 });

    const web = await importWebModule();

    await web.saveBarcodeToGallery("value", 300, 100, "Barcode.PNG");

    expect(downloads[0]?.download).toBe("Barcode.PNG");
  });

  it("does not download anything when generation failed", async () => {
    wasm.generateBarcodeBase64.mockReturnValue({ error: "boom" });

    const web = await importWebModule();

    await expect(
      web.saveBarcodeToGallery("value", 300, 100, "barcode"),
    ).rejects.toThrow("boom");
    expect(downloads).toHaveLength(0);
  });

  it("explains that saving needs a document", async () => {
    wasm.generateQRCodeBase64.mockReturnValue({ value: PNG_BASE64 });
    vi.stubGlobal("document", undefined);

    const web = await importWebModule();

    await expect(
      web.saveQRCodeToGallery("value", 200, 200, "qr"),
    ).rejects.toThrow(
      "Saving an image requires a browser environment with a document",
    );
  });
});

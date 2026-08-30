import createMnbgWasmModule from "../../wasm/mnbg-wasm.js";
import type { MainModule } from "../../wasm/mnbg-wasm.js";
import type { Spec } from "./NativeMobileNativeBarcodeGenerator";

const PNG_DATA_URI_PREFIX = "data:image/png;base64,";

/**
 * Shape of what the bindings return. Emscripten types an `emscripten::val`
 * return as `any`, so the contract is spelled out here instead — exactly one of
 * the two fields is set.
 */
interface WasmResult {
  value?: string;
  error?: string;
}

let modulePromise: Promise<MainModule> | undefined;

/**
 * Instantiates the wasm module once and shares it across every call. A failed
 * instantiation is not cached, so a later call can retry it.
 */
function loadWasmModule(): Promise<MainModule> {
  modulePromise ??= createMnbgWasmModule().catch((reason: unknown) => {
    modulePromise = undefined;
    throw reason;
  });

  return modulePromise;
}

function unwrap(result: unknown): string {
  const { value, error } = result as WasmResult;

  if (error !== undefined) {
    throw new Error(error);
  }

  if (value === undefined) {
    throw new Error("Failed to generate the image");
  }

  return value;
}

function decodeBase64(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function withPngExtension(fileName: string): string {
  return fileName.toLowerCase().endsWith(".png") ? fileName : `${fileName}.png`;
}

/**
 * The web has no gallery to write to, so the browser equivalent is handing the
 * PNG to the user as a download. Resolves with the image as a data URI.
 */
function downloadPng(base64: string, fileName: string): string {
  if (typeof document === "undefined") {
    throw new Error(
      "Saving an image requires a browser environment with a document",
    );
  }

  const blob = new Blob([decodeBase64(base64)], { type: "image/png" });
  const objectUrl = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = withPngExtension(fileName);
    anchor.rel = "noopener";
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return `${PNG_DATA_URI_PREFIX}${base64}`;
}

const NativeBarcodeGenerator: Spec = {
  async generateBarcode(value, width, height) {
    const wasm = await loadWasmModule();

    return unwrap(wasm.generateBarcodeBase64(value, width, height));
  },

  async generateQRCode(value, width, height) {
    const wasm = await loadWasmModule();

    return unwrap(wasm.generateQRCodeBase64(value, width, height));
  },

  async saveBarcodeToGallery(value, width, height, fileName) {
    const wasm = await loadWasmModule();

    return downloadPng(
      unwrap(wasm.generateBarcodeBase64(value, width, height)),
      fileName,
    );
  },

  async saveQRCodeToGallery(value, width, height, fileName) {
    const wasm = await loadWasmModule();

    return downloadPng(
      unwrap(wasm.generateQRCodeBase64(value, width, height)),
      fileName,
    );
  },
};

export default NativeBarcodeGenerator;
